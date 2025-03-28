
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Content, Screen } from '@/types';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { screenServerService } from '@/services/screenServerReal';
import DisplayOptionsDialog from '@/components/screens/DisplayOptionsDialog';
import { useQuery } from '@tanstack/react-query';
import DialogAlerts from './DialogAlerts';
import ScreenSelectionComponent from './ScreenSelectionComponent';
import ContentSelectionComponent from './ContentSelectionComponent';

interface AssignContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  screens: Screen[];
}

const AssignContentDialog: React.FC<AssignContentDialogProps> = ({
  open,
  onOpenChange,
  content,
  selectedScreenId,
  setSelectedScreenId,
  screens
}) => {
  const assignContentToScreen = useAppStore(state => state.assignContentToScreen);
  const baseIpAddress = useAppStore(state => state.baseIpAddress);
  const apiIpAddress = useAppStore(state => state.apiIpAddress);
  const apiPort = useAppStore(state => state.apiPort);
  const useBaseIpForApi = useAppStore(state => state.useBaseIpForApi);
  
  const getScreenById = (id: string) => screens.find(screen => screen.id === id);
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
  const [pendingScreenId, setPendingScreenId] = useState<string | null>(null);
  const [serverContents, setServerContents] = useState<Content[]>([]);
  const [selectedContentId, setSelectedContentId] = useState<string>('none');
  const [isRetrying, setIsRetrying] = useState(false);

  // Ensure API base URL is updated when the dialog opens
  useEffect(() => {
    if (open) {
      screenServerService.updateApiBaseUrl({
        baseIpAddress,
        apiIpAddress,
        apiPort,
        useBaseIpForApi
      });
    }
  }, [open, baseIpAddress, apiIpAddress, apiPort, useBaseIpForApi]);

  // Récupérer la liste des contenus depuis le serveur
  const { 
    data: serverContentData, 
    isLoading: isLoadingContents, 
    error: contentsError,
    refetch: refetchContents 
  } = useQuery({
    queryKey: ['contents', baseIpAddress, apiIpAddress, apiPort, useBaseIpForApi, open],
    queryFn: async () => {
      if (!baseIpAddress || !apiPort) throw new Error("L'API n'est pas configurée");
      
      // Make sure the API URL is updated before making the request
      screenServerService.updateApiBaseUrl({
        baseIpAddress,
        apiIpAddress,
        apiPort,
        useBaseIpForApi
      });
      
      // Add a slight delay to ensure the API is ready (helps with newly created screens)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Construct the API URL
      const ipToUse = useBaseIpForApi ? baseIpAddress : apiIpAddress;
      const url = `http://${ipToUse}:${apiPort}/api/api/content`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des contenus: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.contentList : [];
    },
    enabled: !!(baseIpAddress && apiPort && open),
    retry: 1,
  });

  // Mettre à jour les contenus du serveur quand les données sont chargées
  useEffect(() => {
    if (serverContentData) {
      setServerContents(serverContentData);
      
      // Si un contenu a été sélectionné, on vérifie qu'il existe toujours dans la liste
      if (content && selectedContentId !== 'none') {
        const contentExists = serverContentData.some(c => c.id === selectedContentId);
        if (!contentExists) {
          setSelectedContentId('none');
        }
      }
      
      setIsRetrying(false);
    }
  }, [serverContentData, content, selectedContentId]);

  // Initialiser le contenu sélectionné lors de l'ouverture du dialogue
  useEffect(() => {
    if (open && content) {
      setSelectedContentId(content.id);
    } else if (open) {
      setSelectedContentId('none');
    }
  }, [open, content]);

  const handleRetry = () => {
    setIsRetrying(true);
    screenServerService.updateApiBaseUrl({
      baseIpAddress,
      apiIpAddress,
      apiPort,
      useBaseIpForApi
    });
    refetchContents();
  };

  const handleAssignContent = async () => {
    if (!selectedScreenId) return;
    
    // Si aucun contenu n'est sélectionné, on désassigne le contenu de l'écran
    if (selectedContentId === 'none') {
      assignContentToScreen(selectedScreenId, undefined);
      onOpenChange(false);
      toast.success("Contenu retiré de l'écran avec succès");
      return;
    }
    
    // Récupérer le contenu sélectionné
    const selectedContent = serverContents.find(c => c.id === selectedContentId);
    if (!selectedContent) {
      toast.error("Le contenu sélectionné n'existe pas");
      return;
    }
    
    const screen = getScreenById(selectedScreenId);
    if (!screen) return;
    
    // Sauvegarder l'ancien contentId pour vérifier si le contenu a changé
    const previousContentId = screen.contentId;
    
    // Assigner le nouveau contenu
    assignContentToScreen(selectedScreenId, selectedContent.id);
    
    // Vérifier si le serveur est en cours d'exécution
    const isServerRunning = screenServerService.isServerRunning(selectedScreenId);
    
    // Si le contenu a changé et que le serveur est en cours d'exécution
    if (isServerRunning && previousContentId !== selectedContent.id) {
      // Demander à l'utilisateur de configurer les options d'affichage
      setPendingScreenId(selectedScreenId);
      setIsDisplayOptionsOpen(true);
    } else {
      // Fermer le dialogue d'assignation
      onOpenChange(false);
      toast.success("Contenu assigné à l'écran avec succès");
    }
  };
  
  const handleConfirmDisplayOptions = async (displayOptions: any) => {
    if (!pendingScreenId) return;
    
    // Récupérer le contenu sélectionné
    const selectedContent = serverContents.find(c => c.id === selectedContentId);
    if (!selectedContent) return;
    
    const screen = getScreenById(pendingScreenId);
    if (!screen) return;
    
    console.log(`Mise à jour du serveur pour l'écran ${screen.name} avec le nouveau contenu ${selectedContent.name}`);
    console.log(`Options d'affichage:`, displayOptions);
    
    const success = await screenServerService.updateServer(pendingScreenId, screen.port, selectedContent, displayOptions);
    
    if (success) {
      toast.success(`Le serveur pour l'écran "${screen.name}" a été mis à jour avec le nouveau contenu.`);
    } else {
      toast.error(`Impossible de mettre à jour le serveur pour l'écran "${screen.name}".`);
    }
    
    // Réinitialiser les états
    setPendingScreenId(null);
    onOpenChange(false);
  };

  const noScreens = screens.length === 0;
  const serverNotConfigured = !baseIpAddress || !apiPort;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner à un écran</DialogTitle>
            <DialogDescription>
              Choisissez le contenu à diffuser sur l'écran
            </DialogDescription>
          </DialogHeader>
          
          <DialogAlerts 
            serverNotConfigured={serverNotConfigured}
            noScreens={noScreens}
          />
          
          <div className="space-y-4 py-4">
            <ScreenSelectionComponent
              screens={screens}
              selectedScreenId={selectedScreenId}
              setSelectedScreenId={setSelectedScreenId}
              disabled={noScreens}
            />
            
            <ContentSelectionComponent
              isLoadingContents={isLoadingContents}
              isRetrying={isRetrying}
              contentsError={contentsError as Error | null}
              serverContents={serverContents}
              selectedContentId={selectedContentId}
              setSelectedContentId={setSelectedContentId}
              handleRetry={handleRetry}
              disabled={noScreens || serverNotConfigured}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAssignContent} 
              disabled={!selectedScreenId || noScreens || serverNotConfigured || isLoadingContents || isRetrying}
            >
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedContentId !== 'none' && (
        <DisplayOptionsDialog
          open={isDisplayOptionsOpen}
          onOpenChange={setIsDisplayOptionsOpen}
          content={serverContents.find(c => c.id === selectedContentId) || null}
          onConfirm={handleConfirmDisplayOptions}
          initialOptions={pendingScreenId ? screenServerService.getServerInstance(pendingScreenId)?.displayOptions : undefined}
        />
      )}
    </>
  );
};

export default AssignContentDialog;
