
import React from 'react';
import { 
  File, 
  Image, 
  FileVideo, 
  Presentation,
  FileText,
  Code
} from 'lucide-react';
import { ContentType } from '@/types';

interface ContentTypeIconProps {
  type: ContentType;
  size?: number;
  className?: string; // Add className prop
}

export const getTypeLabel = (type: ContentType): string => {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Vidéo';
    case 'powerpoint':
      return 'PowerPoint';
    case 'pdf':
      return 'PDF';
    case 'html':
      return 'HTML';
    default:
      return 'Fichier';
  }
};

const ContentTypeIcon: React.FC<ContentTypeIconProps> = ({ type, size = 24, className }) => {
  switch (type) {
    case 'image':
      return <Image size={size} className={className} />;
    case 'video':
      return <FileVideo size={size} className={className} />;
    case 'powerpoint':
      return <Presentation size={size} className={className} />;
    case 'pdf':
      return <FileText size={size} className={className} />;
    case 'html':
      return <Code size={size} className={className} />;
    default:
      return <File size={size} className={className} />;
  }
};

export default ContentTypeIcon;
