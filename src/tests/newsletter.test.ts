import { NewsletterEngine } from '../src/core/NewsletterEngine';
import { ContentCurator } from '../src/core/ContentCurator';
import * as fs from 'fs';

describe('🐾 Panther Newsletter Engine Tests', () => {
  let engine: NewsletterEngine;

  beforeEach(() => {
    engine = new NewsletterEngine();
  });

  test('should create engine with fierce attitude', () => {
    expect(engine).toBeDefined();
  });

  test('should load sample content without breaking a sweat', async () => {
    // This will test once we have the dependencies installed
    const samplePath = 'data/sample-week.json';
    
    if (fs.existsSync(samplePath)) {
      await expect(engine.loadContent(samplePath)).resolves.not.toThrow();
    } else {
      console.log('🐾 Sample data not found - test skipped for now');
    }
  });
});

describe('🔥 Content Curation Tests', () => {
  let curator: ContentCurator;

  beforeEach(() => {
    curator = new ContentCurator();
  });

  test('should determine fierceness levels correctly', () => {
    const testContent = {
      week: 'Test Week',
      date: '2025-01-01',
      announcements: [],
      grades: {
        sixth: [{ subject: 'Math', content: 'Students CRUSHED their exams!' }],
        seventh: [{ subject: 'Science', content: 'Good work on lab reports.' }],
        eighth: [{ subject: 'History', content: 'Nice progress this week.' }]
      },
      achievements: [],
      events: []
    };

    const enhanced = curator.enhance(testContent);
    
    // The word "CRUSHED" should trigger fierce or roaring level
    expect(enhanced.grades.sixth[0].fierceness).toBe('ROARING');
    expect(enhanced.grades.seventh[0].fierceness).toBe('medium');
    expect(enhanced.grades.eighth[0].fierceness).toBe('medium');
  });

  test('should generate panther motivation messages', () => {
    const messages = curator.generatePantherMotivation();
    expect(messages).toHaveLength(5);
    expect(messages.every(msg => msg.includes('🐾') || msg.includes('🔥') || msg.includes('⚡'))).toBe(true);
  });
});
