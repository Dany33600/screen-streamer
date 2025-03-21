import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
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
import { Screen, Content } from '@/types';
import { PlusCircle, MonitorPlay, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { screenServerService } from '@/services/screenServerMock';

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
  const [newScreenName, setNewScreenName] = useState('');
  const [selectedContentId, setSelectedContentId] = useState<string>('none');
  
  const handleAddScreen = () => {
    if (newScreenName.trim() === '') {
      toast({
        title: 'Le nom de l\'écran ne peut pas être vide',
        variant: "destructive"
      });
      return;
    }
    
    addScreen(newScreenName);
    setNewScreenName('');
    setIsAddDialogOpen(false);
    toast({
      title: `Écran "${newScreenName}" ajouté avec succès`,
    });
  };
  
  const handleUpdateScreen = () => {
    if (!currentScreen) return;
    if (newScreenName.trim() === '') {
      toast({
        title: 'Le nom de l\'écran ne peut pas être vide',
        variant: "destructive"
      });
      return;
    }
    
    updateScreen(currentScreen.id, { name: newScreenName });
    setCurrentScreen(null);
    setNewScreenName('');
    setIsEditDialogOpen(false);
    toast({
      title: 'Écran mis à jour avec succès',
    });
  };
  
  const handleEditScreen = (screen: Screen) => {
    setCurrentScreen(screen);
    setNewScreenName(screen.name);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteScreen = (id: string) => {
    screenServerService.stopServer(id);
    removeScreen(id);
    toast({
      title: 'Écran supprimé avec succès',
    });
  };
  
  const handleAssignContent = () => {
    if (!currentScreen) return;
    
    const contentId = selectedContentId === 'none' ? undefined : selectedContentId;
    
    assignContentToScreen(currentScreen.id, contentId);
    
    if (screenServerService.isServerRunning(currentScreen.id)) {
      const content = contentId ? contents.find(c => c.id === contentId) : undefined;
      screenServerService.updateServer(currentScreen.id, currentScreen.port, content);
    }
    
    setCurrentScreen(null);
    setSelectedContentId('none');
    setIsAssignDialogOpen(false);
    toast({
      title: 'Contenu assigné avec succès',
    });
  };
  
  const handleOpenAssignDialog = (screen: Screen) => {
    setCurrentScreen(screen);
    setSelectedContentId(screen.contentId || 'none');
    setIsAssignDialogOpen(true);
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
          </div>
        </div>

        {filteredScreens.length > 0 ? (
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
        ) : (
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
            <Button onClick={handleAddScreen}>Ajouter</Button>
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
            <Button onClick={handleUpdateScreen}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner du contenu</DialogTitle>
            <DialogDescription>
              Choisissez le contenu à diffuser sur l'écran {currentScreen?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">Contenu</Label>
              <Select 
                value={selectedContentId} 
                onValueChange={setSelectedContentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contenu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun contenu</SelectItem>
                  {contents.map((content) => (
                    <SelectItem key={content.id} value={content.id}>
                      {content.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignContent}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ScreensPage;
