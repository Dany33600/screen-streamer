
import React from 'react';
import { Film, Image, Presentation, FileText, Code } from 'lucide-react';
import { ContentType } from '@/types';

export interface ContentTypeIconProps {
  type: ContentType;
  className?: string; // Making className optional
}

// Function to get a human-readable label for content types
export const getTypeLabel = (type: ContentType): string => {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Vidéo';
    case 'powerpoint':
      return 'PowerPoint';
    case 'google-slides':
      return 'Google Slides';
    case 'pdf':
      return 'PDF';
    case 'html':
      return 'HTML';
    default:
      return 'Inconnu';
  }
};

const ContentTypeIcon: React.FC<ContentTypeIconProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'image':
      return <Image className={className} />;
    case 'video':
      return <Film className={className} />;
    case 'powerpoint':
    case 'google-slides':
      return <Presentation className={className} />;
    case 'pdf':
      return <FileText className={className} />;
    case 'html':
      return <Code className={className} />;
    default:
      return <Film className={className} />;
  }
};

export default ContentTypeIcon;
