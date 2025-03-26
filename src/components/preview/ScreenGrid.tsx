
import React from 'react';
import { Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Content, Screen } from '@/types';
import { useNavigate } from 'react-router-dom';
import { ScreenGridItem } from './ScreenGridItem';

interface ScreenGridProps {
  screens: Screen[];
  contents: Content[];
}

export const ScreenGrid: React.FC<ScreenGridProps> = ({ screens, contents }) => {
  const navigate = useNavigate();
  
  if (screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <Server className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Aucun écran configuré</h2>
        <p className="text-muted-foreground">Créez des écrans pour les voir apparaître ici</p>
        <Button 
          className="mt-4" 
          onClick={() => navigate('/screens')}
        >
          Configurer des écrans
        </Button>
      </div>
    );
  }
  
  // Déterminer le nombre de colonnes en fonction du nombre d'écrans
  const gridCols = screens.length <= 4 
    ? 'grid-cols-2' 
    : screens.length <= 9 
      ? 'grid-cols-3' 
      : 'grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-2 h-[calc(100vh-8rem)]`}>
      {screens.map((screen) => {
        const content = contents.find(c => c.id === screen.contentId);
        return <ScreenGridItem key={screen.id} screen={screen} content={content} />;
      })}
    </div>
  );
};
