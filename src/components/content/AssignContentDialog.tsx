
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import { Screen, Content } from '@/types';
import ContentTypeIcon from './ContentTypeIcon';
import { Loader2, RefreshCcw } from 'lucide-react';

interface AssignContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  screens: Screen[];
}

const AssignContentDialog = ({
  open,
  onOpenChange,
  content,
  selectedScreenId,
  setSelectedScreenId,
  screens,
}: AssignContentDialogProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverScreens, setServerScreens] = useState<Screen[]>([]);
  
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  
  // Récupérer les écrans du serveur lorsque la boîte de dialogue s'ouvre
  useEffect(() => {
    const getServerScreens = async () => {
      if (!open) return;
      
      setIsLoading(true);
      try {
        // Add a slight delay to ensure the API is ready (helps with newly created screens)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Construct the API URL without duplicating /api
        const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
        const url = `http://${ipToUse}:${apiPort}/api/content`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        
        const data = await response.json();
        if (data.success && data.screens) {
          setServerScreens(data.screens);
        }
      } catch (error) {
        console.error('Error fetching screens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getServerScreens();
  }, [open, baseIpAddress, apiIpAddress, apiPort, useBaseIpForApi]);
  
  // Combiner les écrans locaux et ceux du serveur
  const allScreens = screens;
  
  const handleAssign = async () => {
    if (!content) return;
    
    setIsAssigning(true);
    try {
      const selectedScreen = screens.find(s => s.id === selectedScreenId);
      if (!selectedScreen) {
        throw new Error("L'écran sélectionné n'a pas été trouvé.");
      }
      
      const wasAssigned = await assignContentToScreen(selectedScreenId, content.id);
      
      if (wasAssigned) {
        toast.success('Contenu assigné', {
          description: `${content.name} assigné à ${selectedScreen.name}`,
        });
        onOpenChange(false);
      } else {
        toast.error('Erreur', {
          description: "Impossible d'assigner le contenu à l'écran.",
        });
      }
    } catch (error) {
      console.error('Error assigning content:', error);
      toast.error('Erreur', {
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
      });
    } finally {
      setIsAssigning(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assigner le contenu à un écran</DialogTitle>
        </DialogHeader>
        
        {content ? (
          <div className="space-y-4">
            <div className="flex items-center p-3 border rounded-md bg-muted/50">
              <div className="mr-3">
                <ContentTypeIcon type={content.type} className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-medium">{content.name}</h3>
                <p className="text-sm text-muted-foreground">{content.type}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="screen-select">Choisir un écran</Label>
              <Select 
                value={selectedScreenId} 
                onValueChange={setSelectedScreenId}
                disabled={isAssigning || isLoading}
              >
                <SelectTrigger id="screen-select">
                  <SelectValue placeholder="Sélectionner un écran" />
                </SelectTrigger>
                <SelectContent>
                  {allScreens.length > 0 ? (
                    allScreens.map(screen => (
                      <SelectItem key={screen.id} value={screen.id}>
                        {screen.name} ({screen.ipAddress}:{screen.port})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Aucun écran disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              
              {isLoading && (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Chargement des écrans...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Aucun contenu à afficher
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedScreenId || selectedScreenId === 'none' || isAssigning || !content || isLoading}
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignContentDialog;
