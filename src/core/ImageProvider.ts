import axios from 'axios';
import { PantherTheme } from '../types';

export class ImageProvider {
  private apiKeys: {
    openai?: string;
    stability?: string;
    replicate?: string;
    pexels?: string;
    pixabay?: string;
    unsplash?: string;
    giphy?: string;
  };

  constructor() {
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY,
      stability: process.env.STABILITY_AI_API_KEY,
      replicate: process.env.REPLICATE_API_TOKEN,
      pexels: process.env.PEXELS_API_KEY,
      pixabay: process.env.PIXABAY_API_KEY,
      unsplash: process.env.UNSPLASH_ACCESS_KEY,
      giphy: process.env.GIPHY_API_KEY
    };
  }

  async generateHeaderImage(theme: PantherTheme): Promise<string> {
    // Try DALL-E first for custom panther graphics
    if (this.apiKeys.openai) {
      return await this.generateWithDALLE(theme);
    }
    
    // Fallback to stock images
    if (this.apiKeys.unsplash) {
      return await this.getStockImage('panther fierce black');
    }
    
    // Ultimate fallback - use local assets
    return '/assets/images/panther-header.png';
  }

  async generateMascotVariation(variant: string): Promise<string> {
    const prompts = {
      'reading': 'Fierce black panther wearing glasses, reading a book, educational setting, digital art',
      'sports': 'Athletic black panther in sports gear, energetic pose, competitive spirit',
      'graduation': 'Proud black panther wearing graduation cap, achievement celebration',
      'weather-adaptive': 'Powerful black panther adapting to weather conditions, resilient and strong'
    };

    const prompt = prompts[variant as keyof typeof prompts] || prompts.reading;
    
    if (this.apiKeys.openai) {
      return await this.generateWithDALLE({ prompt });
    }
    
    return `/assets/images/panther-${variant}.png`;
  }

  private async generateWithDALLE(options: any): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt: options.prompt || this.createThemePrompt(options),
          n: 1,
          size: '1024x1024',
          style: 'vivid'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.openai}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data[0].url;
    } catch (error) {
      console.warn('🐾 DALL-E generation failed, using fallback');
      return '/assets/images/panther-default.png';
    }
  }

  private async getStockImage(query: string): Promise<string> {
    if (this.apiKeys.unsplash) {
      try {
        const response = await axios.get(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`,
          {
            headers: {
              'Authorization': `Client-ID ${this.apiKeys.unsplash}`
            }
          }
        );
        
        if (response.data.results.length > 0) {
          return response.data.results[0].urls.regular;
        }
      } catch (error) {
        console.warn('🐾 Unsplash search failed, using local assets');
      }
    }
    
    return '/assets/images/panther-stock.png';
  }

  private createThemePrompt(theme: PantherTheme): string {
    const moodPrompts = {
      'prowling': 'stealthy and focused',
      'fierce': 'intense and powerful',
      'triumphant': 'victorious and proud',
      'storm-ready': 'resilient and strong'
    };

    return `A majestic black panther, ${moodPrompts[theme.mood]}, representing school spirit and academic excellence, high quality digital art, dynamic composition`;
  }

  async generateQRCode(url: string): Promise<string> {
    // QR code generation placeholder
    return '/assets/qr/newsletter-qr.png';
  }
}
