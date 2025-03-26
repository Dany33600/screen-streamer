import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore, initializeScreens } from '@/store';
import ScreenCard from '@/components/screens/ScreenCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { PlusCircle, MonitorPlay, Search, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { screenServerService } from '@/services/screenServerReal';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Content } from '@/types';
import AssignContentDialog from '@/components/content/AssignContentDialog';
import { screenService } from '@/services/screenService';

const ScreensPage = () => {
  const screens = useAppStore((state) => state.screens);
  const addScreen = useAppStore((state) => state.addScreen);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const removeScreen = useAppStore((state) => state.removeScreen);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const isLoadingScreens = useAppStore((state) => state.isLoadingScreens);
  const loadScreens = useAppStore((state) => state.loadScreens);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentScreen, setCurrentScreen] = useState(null);
  const [newScreenName, setNewScreenName] = useState('');
  const [selectedContentId, setSelectedContentId] = useState('none');
  const [serverContents, setServerContents] = useState<Content[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Charger les écrans au montage du composant
  useEffect(() => {
    // Initialiser les écrans depuis le serveur au chargement de la page
    loadScreens().catch(error => {
      console.error('Erreur lors du chargement initial des écrans:', error);
    });
  }, [loadScreens]);
  
  // Récupérer la liste des contenus depuis le serveur
  const { 
    data: serverContentData, 
    isLoading: isLoadingContents, 
    error: contentsError,
    refetch: refetchContents
  } = useQuery({
    queryKey: ['contents', apiUrl],
    queryFn: async () => {
      if (!apiUrl) throw new Error("L'URL de l'API n'est pas configurée");
      
      // Update API URL with store values
      screenServerService.updateApiBaseUrl(apiUrl, baseIpAddress);
      
      const response = await fetch(`${apiUrl}/api/content`);
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des contenus: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.success ? data.contentList : [];
    },
    enabled: !!apiUrl,
    retry: 2,
  });

  // Mettre à jour les contenus du serveur quand les données sont chargées
  useEffect(() => {
    if (serverContentData) {
      setServerContents(serverContentData);
      setIsRetrying(false);
    }
  }, [serverContentData]);
  
  const handleAddScreen = async () => {
    if (newScreenName.trim() === '') {
      toast.error('Le nom de l\'écran ne peut pas être vide');
      return;
    }
    
    const screen = await addScreen(newScreenName);
    if (screen) {
      setNewScreenName('');
      setIsAddDialogOpen(false);
      toast.success(`Écran "${newScreenName}" ajouté avec succès`);
      
      // Make sure to update the API URL after adding a screen
      screenServerService.updateApiBaseUrl(apiUrl, baseIpAddress);
    }
  };
  
  const handleUpdateScreen = async () => {
    if (!currentScreen) return;
    if (newScreenName.trim() === '') {
      toast.error('Le nom de l\'écran ne peut pas être vide');
      return;
    }
    
    const screen = await updateScreen(currentScreen.id, { name: newScreenName });
    if (screen) {
      setCurrentScreen(null);
      setNewScreenName('');
      setIsEditDialogOpen(false);
      toast.success('Écran mis à jour avec succès');
    }
  };
  
  const handleEditScreen = (screen) => {
    setCurrentScreen(screen);
    setNewScreenName(screen.name);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteScreen = async (id) => {
    // Arrêter le serveur d'écran s'il est en cours d'exécution
    screenServerService.stopServer(id);
    
    // Supprimer l'écran du serveur et du store
    const success = await removeScreen(id);
    if (success) {
      toast.success('Écran supprimé avec succès');
    }
  };
  
  const handleAssignContent = async () => {
    if (!currentScreen) return;
    
    const previousContentId = currentScreen.contentId;
    const contentId = selectedContentId === 'none' ? undefined : selectedContentId;
    
    // Mettre à jour l'écran avec le nouveau contenu
    const updatedScreen = await assignContentToScreen(currentScreen.id, contentId);
    
    if (updatedScreen) {
      // Vérifier si le serveur est en cours d'exécution
      const isServerRunning = screenServerService.isServerRunning(currentScreen.id);
      
      // Si le contenu a changé et que le serveur est en cours d'exécution, le redémarrer
      if (isServerRunning && previousContentId !== contentId) {
        if (contentId) {
          // Récupérer le nouveau contenu
          const content = serverContents.find(c => c.id === contentId);
          
          if (content) {
            // Redémarrer le serveur avec le nouveau contenu
            console.log(`Redémarrage du serveur pour l'écran ${currentScreen.name} avec le nouveau contenu ${content.name}`);
            const success = await screenServerService.updateServer(currentScreen.id, currentScreen.port, content);
            
            if (success) {
              toast.success('Serveur mis à jour', {
                description: `Le serveur pour l'écran "${currentScreen.name}" a été mis à jour avec le nouveau contenu.`
              });
            } else {
              toast.error('Erreur de mise à jour', {
                description: `Impossible de mettre à jour le serveur pour l'écran "${currentScreen.name}".`
              });
            }
          } else if (isServerRunning) {
            // Si aucun contenu n'est assigné mais que le serveur est en cours d'exécution, l'arrêter
            screenServerService.stopServer(currentScreen.id);
            toast.info('Serveur arrêté', {
              description: `Le serveur pour l'écran "${currentScreen.name}" a été arrêté car aucun contenu n'est assigné.`
            });
          }
        } else if (isServerRunning) {
          // Si le nouveau contentId est undefined et que le serveur est en cours d'exécution, l'arrêter
          screenServerService.stopServer(currentScreen.id);
          toast.info('Serveur arrêté', {
            description: `Le serveur pour l'écran "${currentScreen.name}" a été arrêté car aucun contenu n'est assigné.`
          });
        }
      }
      
      setCurrentScreen(null);
      setSelectedContentId('none');
      setIsAssignDialogOpen(false);
      toast.success('Contenu assigné avec succès');
    }
  };
  
  const handleOpenAssignDialog = (screen) => {
    setCurrentScreen(screen);
    setSelectedContentId(screen.contentId || 'none');
    
    // Use store values to update API URL
    const state = useAppStore.getState();
    screenServerService.updateApiBaseUrl(state.apiUrl, state.baseIpAddress);
    
    // Refresh content data before opening the dialog
    refetchContents();
    
    setIsAssignDialogOpen(true);
  };
  
  const handleRetry = () => {
    setIsRetrying(true);
    const state = useAppStore.getState();
    screenServerService.updateApiBaseUrl(state.apiUrl, state.baseIpAddress);
    loadScreens();
    refetchContents();
  };
  
  const filteredScreens = searchTerm
    ? screens.filter(screen => 
        screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.port.toString().includes(searchTerm)
      )
    : screens;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Écrans</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos écrans et assignez-leur du contenu
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full md:w-[260px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {isConfigMode && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <PlusCircle size={16} />
                Ajouter
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRetry} 
              disabled={isLoadingScreens || isRetrying}
              title="Rafraîchir les écrans"
            >
              {isLoadingScreens || isRetrying ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
            </Button>
          </div>
        </div>

        {isLoadingScreens && (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={32} className="animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Chargement des écrans...</span>
          </div>
        )}

        {!isLoadingScreens && filteredScreens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreens.map((screen) => (
              <ScreenCard
                key={screen.id}
                screen={screen}
                onEdit={handleEditScreen}
                onDelete={handleDeleteScreen}
                onSelect={handleOpenAssignDialog}
              />
            ))}
          </div>
        ) : !isLoadingScreens && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MonitorPlay size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-1">Aucun écran configuré</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchTerm 
                ? "Aucun écran ne correspond à votre recherche. Essayez d'autres termes."
                : "Commencez par ajouter un écran pour diffuser du contenu. Vous pourrez ensuite lui assigner du contenu."}
            </p>
            {isConfigMode && !searchTerm && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                <PlusCircle size={16} />
                Ajouter un écran
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un écran</DialogTitle>
            <DialogDescription>
              Configurez un nouvel écran pour diffuser du contenu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'écran</Label>
              <Input
                id="name"
                placeholder="Ex: Écran d'accueil"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddScreen} disabled={isLoadingScreens}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'écran</DialogTitle>
            <DialogDescription>
              Modifiez les paramètres de l'écran
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de l'écran</Label>
              <Input
                id="edit-name"
                value={newScreenName}
                onChange={(e) => setNewScreenName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateScreen} disabled={isLoadingScreens}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AssignContentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        content={currentScreen?.contentId ? serverContents.find(c => c.id === currentScreen.contentId) || null : null}
        selectedScreenId={currentScreen?.id || ''}
        setSelectedScreenId={() => {}}
        screens={screens}
      />
    </MainLayout>
  );
};

export default ScreensPage;
