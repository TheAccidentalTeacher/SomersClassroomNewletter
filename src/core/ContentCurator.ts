import { NewsletterContent, ContentItem, Achievement } from '../types';

export class ContentCurator {
  async enhance(content: NewsletterContent): Promise<NewsletterContent> {
    // Add fierceness levels to content items
    content.grades.sixth = this.addFierceness(content.grades.sixth);
    content.grades.seventh = this.addFierceness(content.grades.seventh);
    content.grades.eighth = this.addFierceness(content.grades.eighth);
    
    // Enhance achievements with panther spirit
    content.achievements = this.enhanceAchievements(content.achievements);
    
    return content;
  }

  private addFierceness(items: ContentItem[]): ContentItem[] {
    return items.map(item => ({
      ...item,
      fierceness: this.determineFierceness(item.content)
    }));
  }

  private determineFierceness(content: string): 'mild' | 'medium' | 'fierce' | 'ROARING' {
    const fierceWords = ['amazing', 'outstanding', 'excellent', 'incredible', 'champion'];
    const roaringWords = ['dominate', 'crushed', 'destroyed', 'obliterated', 'conquered'];
    
    const lowerContent = content.toLowerCase();
    
    if (roaringWords.some(word => lowerContent.includes(word))) {
      return 'ROARING';
    }
    
    if (fierceWords.some(word => lowerContent.includes(word))) {
      return 'fierce';
    }
    
    if (lowerContent.includes('good') || lowerContent.includes('nice')) {
      return 'medium';
    }
    
    return 'mild';
  }

  private enhanceAchievements(achievements: Achievement[]): Achievement[] {
    return achievements.map(achievement => ({
      ...achievement,
      fierceness: this.determineAchievementFierceness(achievement)
    }));
  }

  private determineAchievementFierceness(achievement: Achievement): 'mild' | 'medium' | 'fierce' | 'ROARING' {
    const { category, accomplishment } = achievement;
    
    // Academic achievements
    if (category === 'academic') {
      if (accomplishment.toLowerCase().includes('perfect') || 
          accomplishment.toLowerCase().includes('100%')) {
        return 'ROARING';
      }
      if (accomplishment.toLowerCase().includes('honor')) {
        return 'fierce';
      }
    }
    
    // Athletic achievements
    if (category === 'athletic') {
      if (accomplishment.toLowerCase().includes('champion') ||
          accomplishment.toLowerCase().includes('first place')) {
        return 'ROARING';
      }
      if (accomplishment.toLowerCase().includes('medal') ||
          accomplishment.toLowerCase().includes('win')) {
        return 'fierce';
      }
    }
    
    return 'medium';
  }

  generatePantherMotivation(): string[] {
    return [
      "🐾 Prowl with purpose!",
      "🔥 Unleash your inner panther!",
      "⚡ Strike with precision!",
      "🏆 Dominate your goals!",
      "💪 Fierce minds, fierce hearts!"
    ];
  }
}
