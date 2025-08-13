import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import { NewsletterContent, GenerationOptions, GenerationResult, PantherTheme, WeatherData } from '../types';
import { ImageProvider } from './ImageProvider';
import { ContentCurator } from './ContentCurator';

export class NewsletterEngine {
  private content: NewsletterContent | null = null;
  private theme: PantherTheme;
  private imageProvider: ImageProvider;
  private contentCurator: ContentCurator;

  constructor() {
    this.theme = this.getDefaultTheme();
    this.imageProvider = new ImageProvider();
    this.contentCurator = new ContentCurator();
    this.registerHandlebarsHelpers();
  }

  private getDefaultTheme(): PantherTheme {
    return {
      primary: '#000000',
      accent: '#C8102E', // Fierce red
      mood: 'prowling',
      mascotVariant: 'reading'
    };
  }

  private registerHandlebarsHelpers(): void {
    // Fierceness level helper
    Handlebars.registerHelper('fierceClass', (level: string) => {
      const classes = {
        'mild': 'panther-mild',
        'medium': 'panther-medium', 
        'fierce': 'panther-fierce',
        'ROARING': 'panther-roaring'
      };
      return classes[level as keyof typeof classes] || 'panther-mild';
    });

    // Panther emoji based on mood
    Handlebars.registerHelper('pantherMood', (mood: string) => {
      const moods = {
        'prowling': '🐾',
        'fierce': '🔥',
        'triumphant': '🏆',
        'storm-ready': '⚡'
      };
      return moods[mood as keyof typeof moods] || '🐾';
    });

    // Bold text for fierce content
    Handlebars.registerHelper('fierceText', (text: string, level: string) => {
      if (level === 'ROARING') {
        return `<strong class="roaring">${text.toUpperCase()}</strong>`;
      }
      if (level === 'fierce') {
        return `<strong class="fierce">${text}</strong>`;
      }
      return text;
    });
  }

  async loadContent(dataPath: string): Promise<void> {
    const fullPath = path.resolve(dataPath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Content file not found: ${fullPath}`);
    }

    const rawData = fs.readFileSync(fullPath, 'utf-8');
    
    if (dataPath.endsWith('.json')) {
      this.content = JSON.parse(rawData);
    } else if (dataPath.endsWith('.yaml') || dataPath.endsWith('.yml')) {
      // We'll add yaml parsing if needed
      throw new Error('YAML support coming soon! Use JSON for now, fierce one! 🐾');
    } else {
      throw new Error('Unsupported file format. Use JSON or YAML.');
    }

    // Curate and enhance content
    if (this.content) {
      this.content = await this.contentCurator.enhance(this.content);
    }
  }

  setWeatherTheme(weather: WeatherData): void {
    this.content = this.content || {} as NewsletterContent;
    this.content.weather = weather;
    
    // Adapt theme based on weather
    switch (weather.condition) {
      case 'snowy':
        this.theme = {
          ...this.theme,
          accent: '#4A90E2', // Cool blue
          mood: 'storm-ready',
          mascotVariant: 'weather-adaptive'
        };
        break;
      case 'stormy':
        this.theme = {
          ...this.theme,
          accent: '#8B008B', // Dark purple
          mood: 'fierce',
          mascotVariant: 'weather-adaptive'
        };
        break;
      case 'sunny':
        this.theme = {
          ...this.theme,
          accent: '#FFD700', // Gold
          mood: 'triumphant',
          mascotVariant: 'sports'
        };
        break;
      default:
        // Keep default theme
        break;
    }
  }

  async generateImages(): Promise<void> {
    if (!this.content) {
      throw new Error('No content loaded. Call loadContent() first!');
    }

    // Generate theme-appropriate images
    await this.imageProvider.generateHeaderImage(this.theme);
    await this.imageProvider.generateMascotVariation(this.theme.mascotVariant);
  }

  async generate(options: GenerationOptions): Promise<GenerationResult> {
    if (!this.content) {
      throw new Error('No content loaded. Time to prowl for some data! 🐾');
    }

    // Ensure output directory exists
    if (!fs.existsSync(options.outputDir)) {
      fs.mkdirSync(options.outputDir, { recursive: true });
    }

    // Load template
    const templatePath = path.join(__dirname, '../templates/newsletter.hbs');
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);

    // Prepare template data
    const templateData = {
      ...this.content,
      theme: this.theme,
      fierceMode: options.fierceMode,
      generatedAt: new Date().toISOString()
    };

    // Generate HTML
    const html = template(templateData);
    const htmlPath = path.join(options.outputDir, 'index.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');

    const result: GenerationResult = { htmlPath };

    // Generate PDF if requested
    if (options.format === 'pdf' || options.format === 'all') {
      // PDF generation will be implemented with Puppeteer
      console.log('🐾 PDF generation coming in the next prowl!');
    }

    return result;
  }
}
