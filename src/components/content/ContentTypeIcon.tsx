
import React from 'react';
import { Film, Image, Presentation, FileText, Code } from 'lucide-react';
import { ContentType } from '@/types';

export interface ContentTypeIconProps {
  type: ContentType;
  className?: string; // Making className optional
}

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
