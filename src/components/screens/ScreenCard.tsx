
import React, { useState } from 'react';
import { Screen, Content } from '@/types';
import { useAppStore } from '@/store';
import { 
  Edit,
  Trash2,
  MonitorPlay,
  Power,
  Film,
  MoreVertical,
  ExternalLink,
  Info,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useScreenStatus } from '@/hooks/use-screen-status';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { screenServerService } from '@/services/screenServerReal';
import DisplayOptionsDialog from './DisplayOptionsDialog';

interface ScreenCardProps {
  screen: Screen;
  onEdit: (screen: Screen) => void;
  onDelete: (id: string) => void;
  onSelect: (screen: Screen) => void;
}

const ScreenCard: React.FC<ScreenCardProps> = ({ 
  screen, 
  onEdit, 
  onDelete,
  onSelect
}) => {
  const contents = useAppStore((state) => state.contents);
  const navigate = useNavigate();
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
  
  const assignedContent = contents.find(
    (content) => content.id === screen.contentId
  );
  
  const { isOnline, startServer, stopServer, updateServer, content } = useScreenStatus(screen);

  // Récupérer les options d'affichage actuelles depuis le service
  const getCurrentDisplayOptions = () => {
    const serverInstance = screenServerService.getServerInstance(screen.id);
    return serverInstance?.displayOptions || {};
  };

  const handleOpenScreen = () => {
    if (!content) {
      toast({
        title: "Contenu requis",
        description: `Veuillez assigner un contenu à l'écran "${screen.name}" avant de l'ouvrir.`,
        variant: "destructive",
      });
      return;
    }
    
    if (!isOnline) {
      // Ouvrir le dialogue des options d'affichage avant de démarrer
      setIsDisplayOptionsOpen(true);
    } else {
      // Si le serveur est déjà en ligne, ouvrir directement l'URL
      const serverUrl = screenServerService.getServerUrl(screen.id);
      if (serverUrl) {
        window.open(serverUrl, '_blank');
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de trouver l'URL du serveur.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleTogglePower = () => {
    if (isOnline) {
      const success = stopServer();
      if (success) {
        toast({
          title: "Serveur arrêté",
          description: `Le serveur pour l'écran ${screen.name} a été arrêté.`,
        });
      }
    } else {
      if (!content) {
        toast({
          title: "Contenu requis",
          description: `Veuillez assigner un contenu à l'écran "${screen.name}" avant de le démarrer.`,
          variant: "destructive",
        });
        return;
      }
      
      // Ouvrir le dialogue des options d'affichage avant de démarrer
      setIsDisplayOptionsOpen(true);
    }
  };
  
  const handleConfirmDisplayOptions = async (displayOptions: any) => {
    console.log("Options d'affichage configurées:", displayOptions);
    
    // Adapter les options selon le type de contenu
    const adaptedOptions: any = { ...displayOptions };
    
    // Pour PowerPoint, renommer powerPointLoop en loop pour la cohérence
    if (content?.type === 'powerpoint' && 'powerPointLoop' in adaptedOptions) {
      adaptedOptions.loop = adaptedOptions.powerPointLoop;
      delete adaptedOptions.powerPointLoop;
    }
    
    const success = await startServer(adaptedOptions);
    if (success) {
      toast({
        title: "Serveur démarré",
        description: `Le serveur pour l'écran ${screen.name} est maintenant accessible sur http://${screen.ipAddress}:${screen.port}`,
      });
      
      // Attendre un peu que le serveur "démarre" avant d'ouvrir l'URL
      setTimeout(() => {
        const serverUrl = screenServerService.getServerUrl(screen.id);
        if (serverUrl) {
          window.open(serverUrl, '_blank');
        }
      }, 1000);
    } else {
      toast({
        title: "Erreur de démarrage",
        description: `Impossible de démarrer le serveur pour l'écran ${screen.name}.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover-scale">
      <div className="relative h-40 bg-gradient-to-br from-primary/5 to-primary/20 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {assignedContent ? (
            assignedContent.type === 'image' ? (
              <img 
                src={assignedContent.url} 
                alt={assignedContent.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Film size={36} className="mb-2" />
                <span className="text-sm font-medium">{assignedContent.name}</span>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <MonitorPlay size={40} className="mb-2" />
              <span className="text-sm">Aucun contenu</span>
            </div>
          )}
        </div>
        
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <Badge 
            variant={isOnline ? 'default' : 'outline'}
            className={cn(
              "text-xs animate-fade-in",
              isOnline ? "bg-green-500" : "bg-muted"
            )}
          >
            {isOnline ? 'En ligne' : 'Hors ligne'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg">{screen.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {screen.ipAddress}:{screen.port}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(screen)}>
                <Edit size={16} className="mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSelect(screen)}>
                <Film size={16} className="mr-2" />
                Assigner du contenu
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleOpenScreen}
                disabled={!assignedContent}
              >
                <ExternalLink size={16} className="mr-2" />
                Ouvrir dans le navigateur
              </DropdownMenuItem>
              {isOnline && content && (
                <DropdownMenuItem onClick={() => setIsDisplayOptionsOpen(true)}>
                  <Settings size={16} className="mr-2" />
                  Options d'affichage
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(screen.id)}
                className="text-destructive"
              >
                <Trash2 size={16} className="mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {assignedContent && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              {assignedContent.type === 'image' ? 'Image' : 
               assignedContent.type === 'video' ? 'Vidéo' : 
               assignedContent.type === 'powerpoint' ? 'PowerPoint' : 
               assignedContent.type === 'pdf' ? 'PDF' : 'HTML'}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {assignedContent.name}
            </p>
          </div>
        )}
        
        <Alert className="mt-3 py-2 text-xs">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Serveur web: http://{screen.ipAddress}:{screen.port}
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-muted/30 border-t flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8"
          onClick={() => onSelect(screen)}
        >
          <Film size={14} className="mr-1" />
          Assigner
        </Button>
        <Button
          variant={isOnline ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "text-xs h-8",
            isOnline ? "bg-green-600 hover:bg-green-700" : ""
          )}
          onClick={handleTogglePower}
          disabled={!isOnline && !assignedContent}
        >
          <Power size={14} className="mr-1" />
          {isOnline ? 'Arrêter' : 'Démarrer'}
        </Button>
      </CardFooter>
      
      <DisplayOptionsDialog 
        open={isDisplayOptionsOpen} 
        onOpenChange={setIsDisplayOptionsOpen}
        content={content}
        onConfirm={handleConfirmDisplayOptions}
        initialOptions={getCurrentDisplayOptions()}
      />
    </Card>
  );
};

export default ScreenCard;
