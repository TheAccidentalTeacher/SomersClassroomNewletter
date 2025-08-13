export interface NewsletterContent {
  week: string;
  date: string;
  announcements: string[];
  grades: {
    sixth: ContentItem[];
    seventh: ContentItem[];
    eighth: ContentItem[];
  };
  achievements: Achievement[];
  events: Event[];
  weather?: WeatherData;
  theme?: PantherTheme;
}

export interface ContentItem {
  subject: string;
  content: string;
  highlight?: boolean;
  fierceness?: 'mild' | 'medium' | 'fierce' | 'ROARING';
}

export interface Achievement {
  student: string;
  accomplishment: string;
  grade: 6 | 7 | 8;
  category: 'academic' | 'athletic' | 'artistic' | 'leadership';
  fierceness: 'mild' | 'medium' | 'fierce' | 'ROARING';
}

export interface Event {
  title: string;
  date: string;
  time?: string;
  location?: string;
  description: string;
  importance: 'normal' | 'important' | 'CRUCIAL';
}

export interface WeatherData {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'stormy';
  temperature: number;
  description: string;
}

export interface PantherTheme {
  primary: string;
  accent: string;
  mood: 'prowling' | 'fierce' | 'triumphant' | 'storm-ready';
  mascotVariant: 'reading' | 'sports' | 'graduation' | 'weather-adaptive';
}

export interface GenerationOptions {
  format: 'html' | 'pdf' | 'all';
  outputDir: string;
  fierceMode: boolean;
  includeQR?: boolean;
  socialSnippets?: boolean;
}

export interface GenerationResult {
  htmlPath: string;
  pdfPath?: string;
  socialPaths?: string[];
  qrCodes?: string[];
}
