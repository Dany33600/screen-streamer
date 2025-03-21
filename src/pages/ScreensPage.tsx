
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Screen } from '@/types';
import { screenServerService } from '@/server/screenServer';
import { AddScreenDialog } from '@/components/screens/AddScreenDialog';
import { EditScreenDialog } from '@/components/screens/EditScreenDialog';
import { AssignContentDialog } from '@/components/screens/AssignContentDialog';
import { ScreenList } from '@/components/screens/ScreenList';
import { ScreenSearch } from '@/components/screens/ScreenSearch';

const ScreensPage = () => {
  const screens = useAppStore((state) => state.screens);
  const contents = useAppStore((state) => state.contents);
  const addScreen = useAppStore((state) => state.addScreen);
  const updateScreen = useAppStore((state) => state.updateScreen);
  const removeScreen = useAppStore((state) => state.removeScreen);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  
  const handleAddScreen = (name: string) => {
    addScreen(name);
  };
  
  const handleUpdateScreen = (id: string, name: string) => {
    updateScreen(id, { name });
  };
  
  const handleDeleteScreen = (id: string) => {
    screenServerService.stopServer(id);
    removeScreen(id);
  };
  
  const handleAssignContent = (screenId: string, contentId?: string) => {
    assignContentToScreen(screenId, contentId);
    
    if (screenServerService.isServerRunning(screenId) && currentScreen) {
      const content = contentId ? contents.find(c => c.id === contentId) : undefined;
      screenServerService.updateServer(screenId, currentScreen.port, content);
    }
    
    setCurrentScreen(null);
  };
  
  const handleEditScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsEditDialogOpen(true);
  };
  
  const handleOpenAssignDialog = (screen: Screen) => {
    setCurrentScreen(screen);
    setIsAssignDialogOpen(true);
  };

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
          
          <ScreenSearch 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isConfigMode={isConfigMode}
            onAddClick={() => setIsAddDialogOpen(true)}
          />
        </div>

        <ScreenList 
          screens={screens}
          searchTerm={searchTerm}
          isConfigMode={isConfigMode}
          onEdit={handleEditScreen}
          onDelete={handleDeleteScreen}
          onSelect={handleOpenAssignDialog}
          onAdd={() => setIsAddDialogOpen(true)}
        />
      </div>

      <AddScreenDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddScreen={handleAddScreen}
      />

      <EditScreenDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        screen={currentScreen}
        onUpdateScreen={handleUpdateScreen}
      />

      <AssignContentDialog 
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        screen={currentScreen}
        contents={contents}
        onAssignContent={handleAssignContent}
      />
    </MainLayout>
  );
};

export default ScreensPage;
