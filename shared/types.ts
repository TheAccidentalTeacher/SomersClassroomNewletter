// Shared TypeScript types for both client and server

export interface User {
  id: string;
  email: string;
  display_name?: string;
  school?: string;
  subjects?: string[];
  is_admin?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Newsletter {
  id: string;
  user_id: string;
  title: string;
  content: NewsletterContent;
  template_id?: string;
  settings: NewsletterSettings;
  created_at: string;
  updated_at: string;
}

export interface NewsletterContent {
  title: string;
  sections: NewsletterSection[];
}

export interface NewsletterSection {
  id: string;
  type: SectionType;
  title?: string;
  content?: string;
  imageUrl?: string;
  order: number;
  settings?: SectionSettings;
}

export type SectionType = 
  | 'text'
  | 'image'
  | 'title'
  | 'event-list'
  | 'quote'
  | 'ai-summary'
  | 'upcoming-events'
  | 'highlights'
  | 'contact-info';

export interface SectionSettings {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  alignment?: 'left' | 'center' | 'right';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface NewsletterSettings {
  theme: ThemeSettings;
  layout: LayoutSettings;
  export: ExportSettings;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl?: string;
}

export interface LayoutSettings {
  columns: number;
  spacing: number;
  margin: number;
  headerHeight: number;
  footerHeight: number;
}

export interface ExportSettings {
  paperSize: 'letter' | 'a4';
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  includeFooter: boolean;
  watermark?: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  content: NewsletterContent;
  settings: NewsletterSettings;
  is_public: boolean;
  is_global?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ImageResult {
  id: string;
  url: string;
  thumbnail: string;
  description?: string;
  photographer?: string;
  source: 'unsplash' | 'pexels' | 'pixabay' | 'giphy' | 'ai-generated';
}

export interface AIRequest {
  prompt: string;
  contentType?: 'summary' | 'upcoming' | 'title' | 'general';
  subject?: string;
  gradeLevel?: string;
  mood?: string;
  theme?: string;
}

export interface AIResponse {
  content?: string;
  imageUrl?: string;
  colors?: ColorPalette;
  suggestions?: string[];
  usage?: any;
  source?: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface ShareOptions {
  shareType: 'link' | 'email' | 'download';
  recipients?: string[];
  message?: string;
  expiresAt?: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type CreateRequest<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;
export type UpdateRequest<T> = DeepPartial<Omit<T, 'id' | 'created_at' | 'updated_at'>>;

// Constants
export const SECTION_TYPES: SectionType[] = [
  'text',
  'image', 
  'title',
  'event-list',
  'quote',
  'ai-summary',
  'upcoming-events',
  'highlights',
  'contact-info'
];

export const SUBJECTS = [
  'Mathematics',
  'Social Studies',
  'Physical Education',
  'Science',
  'English Language Arts',
  'Art',
  'Music',
  'Foreign Language',
  'Computer Science',
  'Health'
] as const;

export const GRADE_LEVELS = [
  'Elementary',
  'Middle School',
  'High School'
] as const;

export const FONT_FAMILIES = [
  'Inter',
  'Poppins',
  'Arial',
  'Georgia',
  'Times New Roman',
  'Helvetica',
  'Comic Sans MS'
] as const;
