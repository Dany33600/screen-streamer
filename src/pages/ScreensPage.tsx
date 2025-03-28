import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import { screenServerService } from '@/services/screenServerReal';

// Custom hooks
import { useScreenOperations } from '@/hooks/use-screen-operations';
import { useContentData } from '@/hooks/use-content-data';

// Components
import ScreensHeader from '@/components/screens/ScreensHeader';
import ScreensList from '@/components/screens/ScreensList';
import ScreenDialogManager from '@/components/screens/ScreenDialogManager';

const ScreensPage = () => {
  // State for UI
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get configuration mode from store
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const getApiUrl = useAppStore((state) => state.getApiUrl);
  
  // Custom hooks for data and operations
  const {
    screens,
    isLoadingScreens,
    isRetrying,
    currentScreen,
    selectedContentId,
    handleAddScreen,
    handleUpdateScreen,
    handleDeleteScreen,
    handleAssignContent,
    handleRetry,
    setCurrentScreen,
    setSelectedContentId,
    loadScreens
  } = useScreenOperations();
  
  const {
    serverContents,
    refetchContents
  } = useContentData();
  
  // Charger les écrans au montage du composant et lorsque l'URL de l'API change
  useEffect(() => {
    // Mettre à jour l'URL de l'API dans le service avant de charger les écrans
    screenServerService.updateApiBaseUrl({
      baseIpAddress: baseIpAddress,
      apiIpAddress: apiIpAddress,
      apiPort: apiPort,
      useBaseIpForApi: useBaseIpForApi
    });
    
    // Initialiser les écrans depuis le serveur au chargement de la page
    loadScreens().catch(error => {
      console.error('Erreur lors du chargement initial des écrans:', error);
    });
  }, [loadScreens, baseIpAddress, apiIpAddress, apiPort, useBaseIpForApi, getApiUrl]);
  
  // Event handlers for dialog actions
  const onAddScreen = async (screenName: string) => {
    const screen = await handleAddScreen(screenName);
    if (screen) {
      setIsAddDialogOpen(false);
    }
  };
  
  const onUpdateScreen = async (screenId: string, screenName: string) => {
    const screen = await handleUpdateScreen(screenId, screenName);
    if (screen) {
      setIsEditDialogOpen(false);
    }
  };
  
  const onEditScreen = (screen) => {
    setCurrentScreen(screen);
    setIsEditDialogOpen(true);
  };
  
  const onOpenAssignDialog = (screen) => {
    setCurrentScreen(screen);
    setSelectedContentId(screen.contentId || 'none');
    
    // Use store values to update API URL
    screenServerService.updateApiBaseUrl({
      baseIpAddress: baseIpAddress,
      apiIpAddress: apiIpAddress,
      apiPort: apiPort,
      useBaseIpForApi: useBaseIpForApi
    });
    
    // Refresh content data before opening the dialog
    refetchContents();
    
    setIsAssignDialogOpen(true);
  };
  
  const onAssignContent = async () => {
    if (!currentScreen) return;
    
    const success = await handleAssignContent(
      currentScreen, 
      selectedContentId, 
      serverContents
    );
    
    if (success) {
      setCurrentScreen(null);
      setSelectedContentId('none');
      setIsAssignDialogOpen(false);
    }
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
          onEdit={onEditScreen}
          onDelete={handleDeleteScreen}
          onSelect={onOpenAssignDialog}
          onAddScreen={() => setIsAddDialogOpen(true)}
          isConfigMode={isConfigMode}
        />
      </div>

      <ScreenDialogManager
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isAssignDialogOpen={isAssignDialogOpen}
        setIsAssignDialogOpen={setIsAssignDialogOpen}
        currentScreen={currentScreen}
        selectedContentId={selectedContentId}
        isLoadingScreens={isLoadingScreens}
        screens={screens}
        serverContents={serverContents}
        onAddScreen={onAddScreen}
        onUpdateScreen={onUpdateScreen}
        onAssignContent={onAssignContent}
      />
    </MainLayout>
  );
};

export default ScreensPage;
