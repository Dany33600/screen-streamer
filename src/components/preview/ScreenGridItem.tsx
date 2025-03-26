
import React from 'react';
import { ExternalLink, Server } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Content, Screen } from '@/types';
import { screenServerService } from '@/services/screenServerReal';

interface ScreenGridItemProps {
  screen: Screen;
  content?: Content;
}

export const ScreenGridItem: React.FC<ScreenGridItemProps> = ({ screen, content }) => {
  const isRunning = screenServerService.isServerRunning(screen.id);
  const screenUrl = `http://${screen.ipAddress}:${screen.port}`;
  
  return (
    <Card 
      key={screen.id} 
      className={`overflow-hidden hover:shadow-md ${
        isRunning ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <CardHeader className="p-2 bg-slate-800 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm truncate">{screen.name}</CardTitle>
          <Badge variant={isRunning ? "success" : "destructive"} className="text-xs">
            {isRunning ? 'En ligne' : 'Hors ligne'}
          </Badge>
        </div>
        <p className="text-xs text-slate-300 mt-0">
          {screen.ipAddress}:{screen.port}
        </p>
      </CardHeader>
      
      <div className="relative w-full h-[calc(100%-80px)]">
        {isRunning ? (
          <iframe 
            src={screenUrl}
            title={screen.name}
            className="w-full h-full border-none"
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full bg-slate-100">
            <Server className="h-12 w-12 text-slate-400 mb-2" />
            <span className="text-sm text-muted-foreground">Écran hors ligne</span>
          </div>
        )}
      </div>
      
      <CardFooter className="p-2 flex justify-between bg-slate-100">
        <div className="truncate">
          {screen.contentId && content && (
            <div className="text-xs text-muted-foreground truncate">
              {content.name || "Contenu assigné"}
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-8" 
          onClick={() => window.open(screenUrl, '_blank')}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          <span className="text-xs">Ouvrir</span>
        </Button>
      </CardFooter>
    </Card>
  );
};
