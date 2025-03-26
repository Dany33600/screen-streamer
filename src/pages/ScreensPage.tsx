
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Content } from '@/types';
import { screenServerService } from '@/services/screenServerReal';

// Composants refactorisés
import ScreensHeader from '@/components/screens/ScreensHeader';
import ScreensList from '@/components/screens/ScreensList';
import AddScreenDialog from '@/components/screens/AddScreenDialog';
import EditScreenDialog from '@/components/screens/EditScreenDialog';
import AssignContentDialog from '@/components/content/AssignContentDialog';

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
      screenServerService.updateApiBaseUrl({
        apiUrl,
        baseIpAddress
      });
      
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
  
  const handleAddScreen = async (screenName: string) => {
    const screen = await addScreen(screenName);
    if (screen) {
      setIsAddDialogOpen(false);
      toast.success(`Écran "${screenName}" ajouté avec succès`);
      
      // Make sure to update the API URL after adding a screen
      screenServerService.updateApiBaseUrl({
        apiUrl,
        baseIpAddress
      });
    }
  };
  
  const handleUpdateScreen = async (screenId: string, screenName: string) => {
    const screen = await updateScreen(screenId, { name: screenName });
    if (screen) {
      setCurrentScreen(null);
      setIsEditDialogOpen(false);
      toast.success('Écran mis à jour avec succès');
    }
  };
  
  const handleEditScreen = (screen) => {
    setCurrentScreen(screen);
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
    screenServerService.updateApiBaseUrl({
      apiUrl: state.apiUrl,
      baseIpAddress: state.baseIpAddress
    });
    
    // Refresh content data before opening the dialog
    refetchContents();
    
    setIsAssignDialogOpen(true);
  };
  
  const handleRetry = () => {
    setIsRetrying(true);
    const state = useAppStore.getState();
    screenServerService.updateApiBaseUrl({
      apiUrl: state.apiUrl,
      baseIpAddress: state.baseIpAddress
    });
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
        <ScreensHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddScreen={() => setIsAddDialogOpen(true)}
          onRefresh={handleRetry}
          isConfigMode={isConfigMode}
          isLoading={isLoadingScreens}
          isRetrying={isRetrying}
        />

        <ScreensList
          screens={screens}
          filteredScreens={filteredScreens}
          isLoading={isLoadingScreens}
          searchTerm={searchTerm}
          onEdit={handleEditScreen}
          onDelete={handleDeleteScreen}
          onSelect={handleOpenAssignDialog}
          onAddScreen={() => setIsAddDialogOpen(true)}
          isConfigMode={isConfigMode}
        />
      </div>

      <AddScreenDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddScreen={handleAddScreen}
        isLoading={isLoadingScreens}
      />

      <EditScreenDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateScreen={handleUpdateScreen}
        currentScreen={currentScreen}
        isLoading={isLoadingScreens}
      />

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
