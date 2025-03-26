
import { useAppStore } from '@/store';
import { Content, Screen } from '@/types';

export function useContentResolver(screen: Screen) {
  const contents = useAppStore((state) => state.contents);
  
  // Find the content assigned to this screen
  const content = screen.contentId 
    ? contents.find(c => c.id === screen.contentId) 
    : undefined;
    
  return { content };
}
