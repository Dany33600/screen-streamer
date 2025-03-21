
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

const ContentTypeIcon: React.FC<ContentTypeIconProps> = ({ type, size = 24 }) => {
  switch (type) {
    case 'image':
      return <Image size={size} />;
    case 'video':
      return <FileVideo size={size} />;
    case 'powerpoint':
      return <Presentation size={size} />;
    case 'pdf':
      return <FileText size={size} />;
    case 'html':
      return <Code size={size} />;
    default:
      return <File size={size} />;
  }
};

export default ContentTypeIcon;
