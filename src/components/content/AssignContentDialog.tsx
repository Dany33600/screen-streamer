import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Content, Screen } from '@/types';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { screenServerService } from '@/services/screenServerReal';
import DisplayOptionsDialog from '@/components/screens/DisplayOptionsDialog';
import { useQuery } from '@tanstack/react-query';

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
  const apiUrl = useAppStore(state => state.apiUrl);
  const baseIpAddress = useAppStore(state => state.baseIpAddress);
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
        apiUrl,
        baseIpAddress
      });
    }
  }, [open, apiUrl, baseIpAddress]);

  // Récupérer la liste des contenus depuis le serveur
  const { 
    data: serverContentData, 
    isLoading: isLoadingContents, 
    error: contentsError,
    refetch: refetchContents 
  } = useQuery({
    queryKey: ['contents', apiUrl, open],
    queryFn: async () => {
      if (!apiUrl) throw new Error("L'URL de l'API n'est pas configurée");
      
      // Make sure the API URL is updated before making the request
      screenServerService.updateApiBaseUrl({
        apiUrl,
        baseIpAddress
      });
      
      // Add a slight delay to ensure the API is ready (helps with newly created screens)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch(`${apiUrl}/api/content`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des contenus: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.contentList : [];
    },
    enabled: !!apiUrl && open,
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
      apiUrl,
      baseIpAddress
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
  const serverNotConfigured = !apiUrl || apiUrl === '';

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
          
          {serverNotConfigured && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Le serveur API n'est pas configuré. Veuillez configurer l'URL de l'API dans les paramètres.
              </AlertDescription>
            </Alert>
          )}
          
          {noScreens && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>
                Aucun écran n'est disponible. Veuillez d'abord ajouter un écran.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="screen">Écran</Label>
              <Select value={selectedScreenId} onValueChange={setSelectedScreenId} disabled={noScreens}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un écran" />
                </SelectTrigger>
                <SelectContent>
                  {screens.map((screen) => (
                    <SelectItem key={screen.id} value={screen.id}>
                      {screen.name} ({screen.ipAddress}:{screen.port})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              {isLoadingContents || isRetrying ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des contenus...
                </div>
              ) : contentsError ? (
                <div>
                  <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>
                      Erreur lors du chargement des contenus. Veuillez vérifier la connexion au serveur.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleRetry}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Réessayer
                  </Button>
                </div>
              ) : (
                <Select 
                  value={selectedContentId} 
                  onValueChange={setSelectedContentId}
                  disabled={noScreens || serverNotConfigured}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contenu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun contenu</SelectItem>
                    {serverContents.map((content) => (
                      <SelectItem key={content.id} value={content.id}>
                        {content.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
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
