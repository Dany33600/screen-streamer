export type ContentType = 'image' | 'video' | 'powerpoint' | 'pdf' | 'html' | 'google-slides';

export interface Content {
  id: string;
  name: string;
  type: ContentType;
  url: string;
  file?: File;
  thumbnail?: string;
  duration?: number; // en secondes pour les vidéos
  createdAt: number;
}

export interface Screen {
  id: string;
  name: string;
  port: number;
  ipAddress: string;
  status: 'online' | 'offline';
  contentId?: string;
  createdAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  contentIds: string[];
  createdAt: number;
}
