// API service that uses Railway environment variables
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Railway serves API at /api in production
  : 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Newsletters
  async getNewsletters() {
    return this.request('/newsletters');
  }

  async getNewsletter(id) {
    return this.request(`/newsletters/${id}`);
  }

  async createNewsletter(newsletterData) {
    return this.request('/newsletters', {
      method: 'POST',
      body: newsletterData,
    });
  }

  async updateNewsletter(id, newsletterData) {
    return this.request(`/newsletters/${id}`, {
      method: 'PUT',
      body: newsletterData,
    });
  }

  async deleteNewsletter(id) {
    return this.request(`/newsletters/${id}`, {
      method: 'DELETE',
    });
  }

  async duplicateNewsletter(id) {
    return this.request(`/newsletters/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async shareNewsletter(id, shareData) {
    return this.request(`/newsletters/${id}/share`, {
      method: 'POST',
      body: shareData,
    });
  }

  // Templates
  async getTemplates() {
    return this.request('/templates');
  }

  async getPublicTemplates() {
    return this.request('/templates/public');
  }

  async getTemplate(id) {
    return this.request(`/templates/${id}`);
  }

  async createTemplate(templateData) {
    return this.request('/templates', {
      method: 'POST',
      body: templateData,
    });
  }

  async updateTemplate(id, templateData) {
    return this.request(`/templates/${id}`, {
      method: 'PUT',
      body: templateData,
    });
  }

  async deleteTemplate(id) {
    return this.request(`/templates/${id}`, {
      method: 'DELETE',
    });
  }

  async shareTemplate(id, shareData) {
    return this.request(`/templates/${id}/share`, {
      method: 'POST',
      body: shareData,
    });
  }

  // AI Services
  async generateContent(prompt, type = 'text', options = {}) {
    return this.request('/ai/generate-content', {
      method: 'POST',
      body: { prompt, type, options },
    });
  }

  async summarizeContent(content, maxLength = 200) {
    return this.request('/ai/summarize', {
      method: 'POST',
      body: { content, maxLength },
    });
  }

  async generateColors(theme, mood = 'professional') {
    return this.request('/ai/generate-colors', {
      method: 'POST',
      body: { theme, mood },
    });
  }

  // Image Services
  async searchImages(query, source = 'auto', options = {}) {
    const params = new URLSearchParams({
      q: query,
      source,
      ...options,
    });
    return this.request(`/images/search?${params}`);
  }

  async searchGifs(query, options = {}) {
    const params = new URLSearchParams({
      q: query,
      ...options,
    });
    return this.request(`/images/gifs?${params}`);
  }

  async getImageSources() {
    return this.request('/images/sources');
  }

  // Export Services
  async exportToPDF(newsletterData, options = {}) {
    return this.request('/export/pdf', {
      method: 'POST',
      body: { newsletter: newsletterData, options },
    });
  }

  async exportToDOCX(newsletterData, options = {}) {
    return this.request('/export/docx', {
      method: 'POST',
      body: { newsletter: newsletterData, options },
    });
  }

  async createGoogleDoc(newsletterData, options = {}) {
    return this.request('/export/google-doc', {
      method: 'POST',
      body: { newsletter: newsletterData, options },
    });
  }

  async getExportFormats() {
    return this.request('/export/formats');
  }

  async getExportHistory() {
    return this.request('/export/history');
  }

  // Admin Services (Super Admin only)
  async getUsers() {
    return this.request('/admin/users');
  }

  async getSystemStats() {
    return this.request('/admin/stats');
  }

  async updateUserStatus(userId, status) {
    return this.request(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: { status },
    });
  }

  async getAllNewsletters() {
    return this.request('/admin/newsletters');
  }

  async getAllTemplates() {
    return this.request('/admin/templates');
  }

  async createGlobalTemplate(templateData) {
    return this.request('/admin/templates/global', {
      method: 'POST',
      body: templateData,
    });
  }

  async getSystemHealth() {
    return this.request('/admin/health');
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
