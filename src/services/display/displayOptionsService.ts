
import { Content } from '@/types';

export class DisplayOptionsService {
  /**
   * Determine display options based on content type
   */
  public getDisplayOptions(content: Content, userOptions?: any): any {
    // Get content-type specific default options
    const typeDefaults = this.getTypeSpecificDefaults(content.type);
    
    // Merge with general defaults and user options
    return {
      // General defaults
      autoplay: true,
      loop: true,
      controls: true,
      muted: true,
      interval: 5000,
      autoSlide: 5000,
      // Type-specific defaults
      ...typeDefaults,
      // User options override everything
      ...userOptions
    };
  }
  
  /**
   * Get default options specific to content type
   */
  private getTypeSpecificDefaults(contentType: string): object {
    switch (contentType) {
      case 'video':
        return {
          muted: true,
          controls: true,
          autoplay: true,
          loop: true
        };
      case 'image':
        return {
          interval: 10000, // Images show for longer by default
          transition: 'fade'
        };
      case 'pdf':
      case 'powerpoint':
        return {
          autoSlide: 8000, // Slides change more slowly
          showControls: false
        };
      default:
        return {};
    }
  }
}

export const displayOptionsService = new DisplayOptionsService();
