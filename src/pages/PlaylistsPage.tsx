
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Playlist } from '@/types';
import {
  PlusCircle,
  Search,
  List,
  Edit,
  Trash2,
  MoreVertical,
  MonitorPlay,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const PlaylistsPage = () => {
  const playlists = useAppStore((state) => state.playlists);
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const addPlaylist = useAppStore((state) => state.addPlaylist);
  const updatePlaylist = useAppStore((state) => state.updatePlaylist);
  const removePlaylist = useAppStore((state) => state.removePlaylist);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [playlistName, setPlaylistName] = useState('');
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  
  const handleAddPlaylist = () => {
    if (playlistName.trim() === '') {
      toast.error('Le nom de la playlist ne peut pas être vide');
      return;
    }
    
    if (selectedContentIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un contenu');
      return;
    }
    
    addPlaylist(playlistName, selectedContentIds);
    resetPlaylistForm();
    setIsAddDialogOpen(false);
    toast.success(`Playlist "${playlistName}" créée avec succès`);
  };
  
  const handleUpdatePlaylist = () => {
    if (!currentPlaylist) return;
    
    if (playlistName.trim() === '') {
      toast.error('Le nom de la playlist ne peut pas être vide');
      return;
    }
    
    if (selectedContentIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un contenu');
      return;
    }
    
    updatePlaylist(currentPlaylist.id, {
      name: playlistName,
      contentIds: selectedContentIds
    });
    
    setCurrentPlaylist(null);
    resetPlaylistForm();
    setIsEditDialogOpen(false);
    toast.success('Playlist mise à jour avec succès');
  };
  
  const handleEditPlaylist = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setPlaylistName(playlist.name);
    setSelectedContentIds([...playlist.contentIds]);
    setIsEditDialogOpen(true);
  };
  
  const handleDeletePlaylist = (id: string) => {
    removePlaylist(id);
    toast.success('Playlist supprimée avec succès');
  };
  
  const handleAssignPlaylist = () => {
    if (!currentPlaylist || !selectedScreenId) return;
    
    // On assigne simplement le premier contenu de la playlist à l'écran
    // Dans une véritable application, on pourrait créer un système de rotation
    if (currentPlaylist.contentIds.length > 0) {
      assignContentToScreen(selectedScreenId, currentPlaylist.contentIds[0]);
      toast.success('Premier contenu de la playlist assigné à l\'écran');
    } else {
      toast.error('La playlist ne contient aucun contenu');
    }
    
    setCurrentPlaylist(null);
    setSelectedScreenId('');
    setIsAssignDialogOpen(false);
  };
  
  const handleOpenAssignDialog = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    setSelectedScreenId('');
    setIsAssignDialogOpen(true);
  };
  
  const resetPlaylistForm = () => {
    setPlaylistName('');
    setSelectedContentIds([]);
  };
  
  const handleContentCheckChange = (contentId: string, checked: boolean) => {
    if (checked) {
      setSelectedContentIds((prev) => [...prev, contentId]);
    } else {
      setSelectedContentIds((prev) => prev.filter((id) => id !== contentId));
    }
  };
  
  const filteredPlaylists = searchTerm
    ? playlists.filter(playlist => 
        playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : playlists;

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez des playlists de contenus
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
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <PlusCircle size={16} />
              Créer
            </Button>
          </div>
        </div>

        {filteredPlaylists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaylists.map((playlist) => (
              <Card key={playlist.id} className="hover-scale">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>{playlist.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditPlaylist(playlist)}>
                          <Edit size={16} className="mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenAssignDialog(playlist)}>
                          <MonitorPlay size={16} className="mr-2" />
                          Assigner à un écran
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeletePlaylist(playlist.id)}
                          className="text-destructive"
                        >
                          <Trash2 size={16} className="mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    {playlist.contentIds.length} contenu{playlist.contentIds.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {playlist.contentIds.slice(0, 3).map((contentId) => {
                      const content = contents.find((c) => c.id === contentId);
                      if (!content) return null;
                      
                      return (
                        <div 
                          key={contentId} 
                          className="flex items-center gap-3 p-2 bg-muted/30 rounded-md"
                        >
                          {content.type === 'image' ? (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                              <img src={content.url} alt={content.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                              <List size={20} />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{content.name}</p>
                            <Badge variant="outline" className="text-xs">
                              {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    
                    {playlist.contentIds.length > 3 && (
                      <div className="text-center text-sm text-muted-foreground pt-2">
                        + {playlist.contentIds.length - 3} autre{playlist.contentIds.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                    
                    {playlist.contentIds.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground py-4">
                        Aucun contenu dans cette playlist
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-3 border-t flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-8"
                    onClick={() => handleEditPlaylist(playlist)}
                  >
                    <Edit size={14} className="mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleOpenAssignDialog(playlist)}
                  >
                    <MonitorPlay size={14} className="mr-1" />
                    Assigner
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <List size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-1">Aucune playlist trouvée</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchTerm
                ? "Aucune playlist ne correspond à votre recherche."
                : "Créez des playlists pour organiser vos contenus et les diffuser en séquence."}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <PlusCircle size={16} />
              Créer une playlist
            </Button>
          </div>
        )}
      </div>

      {/* Dialog: Créer une playlist */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Créer une playlist</DialogTitle>
            <DialogDescription>
              Créez une nouvelle playlist et sélectionnez les contenus à inclure
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la playlist</Label>
              <Input
                id="name"
                placeholder="Ma playlist"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contenus</Label>
              <ScrollArea className="h-60 border rounded-md p-2">
                {contents.length > 0 ? (
                  <div className="space-y-4">
                    {contents.map((content) => (
                      <div key={content.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`content-${content.id}`}
                          checked={selectedContentIds.includes(content.id)}
                          onCheckedChange={(checked) => 
                            handleContentCheckChange(content.id, checked === true)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`content-${content.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {content.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucun contenu disponible. Importez d'abord du contenu.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              resetPlaylistForm();
              setIsAddDialogOpen(false);
            }}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddPlaylist} 
              disabled={playlistName.trim() === '' || selectedContentIds.length === 0}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Modifier une playlist */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la playlist</DialogTitle>
            <DialogDescription>
              Modifiez le nom et les contenus de la playlist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la playlist</Label>
              <Input
                id="edit-name"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Contenus</Label>
              <ScrollArea className="h-60 border rounded-md p-2">
                {contents.length > 0 ? (
                  <div className="space-y-4">
                    {contents.map((content) => (
                      <div key={content.id} className="flex items-start space-x-3">
                        <Checkbox
                          id={`edit-content-${content.id}`}
                          checked={selectedContentIds.includes(content.id)}
                          onCheckedChange={(checked) => 
                            handleContentCheckChange(content.id, checked === true)
                          }
                        />
                        <div className="grid gap-1.5 leading-none">
                          <label
                            htmlFor={`edit-content-${content.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {content.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Aucun contenu disponible. Importez d'abord du contenu.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUpdatePlaylist}
              disabled={playlistName.trim() === '' || selectedContentIds.length === 0}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Assigner à un écran */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner à un écran</DialogTitle>
            <DialogDescription>
              Choisissez l'écran sur lequel diffuser cette playlist
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {currentPlaylist && (
              <>
                <p className="text-sm">
                  <span className="font-medium">Playlist :</span> {currentPlaylist.name}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Contenu(s) :</span> {currentPlaylist.contentIds.length}
                </p>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="screen">Écran</Label>
              <Select value={selectedScreenId} onValueChange={setSelectedScreenId}>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignPlaylist} disabled={!selectedScreenId}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default PlaylistsPage;
