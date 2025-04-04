
import React from 'react';
import AddScreenDialog from '@/components/screens/AddScreenDialog';
import EditScreenDialog from '@/components/screens/EditScreenDialog';
import AssignContentDialog from '@/components/screens/AssignContentDialog';
import { Screen, Content } from '@/types';

interface ScreenDialogManagerProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isAssignDialogOpen: boolean;
  setIsAssignDialogOpen: (open: boolean) => void;
  currentScreen: Screen | null;
  selectedContentId: string;
  isLoadingScreens: boolean;
  screens: Screen[];
  serverContents: Content[];
  onAddScreen: (name: string) => Promise<void>;
  onUpdateScreen: (id: string, name: string) => Promise<void>;
  onAssignContent: () => Promise<void>;
}

const ScreenDialogManager: React.FC<ScreenDialogManagerProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isAssignDialogOpen,
  setIsAssignDialogOpen,
  currentScreen,
  selectedContentId,
  isLoadingScreens,
  screens,
  serverContents,
  onAddScreen,
  onUpdateScreen,
  onAssignContent
}) => {
  return (
    <>
      <AddScreenDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddScreen={onAddScreen}
        isLoading={isLoadingScreens}
      />

      <EditScreenDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUpdateScreen={onUpdateScreen}
        currentScreen={currentScreen}
        isLoading={isLoadingScreens}
      />

      <AssignContentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        screen={currentScreen}
        selectedContentId={selectedContentId}
        setSelectedContentId={(id: string) => {}}
        screens={screens}
        contents={serverContents}
        onAssignContent={onAssignContent}
      />
    </>
  );
};

export default ScreenDialogManager;
