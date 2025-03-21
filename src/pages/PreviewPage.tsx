
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Screen, Content } from '@/types';
import { MonitorPlay, RefreshCw, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const PreviewPage = () => {
  const screens = useAppStore((state) => state.screens);
  const contents = useAppStore((state) => state.contents);
  
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const selectedScreen = screens.find(screen => screen.id === selectedScreenId);
  const assignedContent = selectedScreen?.contentId 
    ? contents.find(content => content.id === selectedScreen.contentId)
    : undefined;
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  const handleOpenScreen = () => {
    if (!selectedScreen) return;
    const url = `http://${selectedScreen.ipAddress}:${selectedScreen.port}`;
    window.open(url, '_blank');
  };
  
  useEffect(() => {
    if (screens.length > 0 && !selectedScreenId) {
      setSelectedScreenId(screens[0].id);
    }
  }, [screens, selectedScreenId]);

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Aperçu</h1>
          <p className="text-muted-foreground mt-1">
            Prévisualisez le contenu diffusé sur vos écrans
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Écrans</CardTitle>
              <CardDescription>
                Sélectionnez un écran pour le prévisualiser
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="screen-select">Écran</Label>
                  <Select 
                    value={selectedScreenId} 
                    onValueChange={setSelectedScreenId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un écran" />
                    </SelectTrigger>
                    <SelectContent>
                      {screens.map((screen) => (
                        <SelectItem key={screen.id} value={screen.id}>
                          {screen.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedScreen && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">IP Address</Label>
                      <p className="text-sm">{selectedScreen.ipAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Port</Label>
                      <p className="text-sm">{selectedScreen.port}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            selectedScreen.status === 'online' 
                              ? 'bg-green-500' 
                              : 'bg-gray-300'
                          }`} 
                        />
                        <p className="text-sm">
                          {selectedScreen.status === 'online' ? 'En ligne' : 'Hors ligne'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Contenu assigné</Label>
                      {assignedContent ? (
                        <p className="text-sm">{assignedContent.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aucun contenu assigné</p>
                      )}
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <Button 
                        className="w-full gap-2" 
                        onClick={handleOpenScreen}
                      >
                        <ExternalLink size={16} />
                        Ouvrir dans un navigateur
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2" 
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                      >
                        <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                        Rafraîchir
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Aperçu</CardTitle>
              <CardDescription>
                {selectedScreen 
                  ? `Contenu diffusé sur ${selectedScreen.name}`
                  : "Sélectionnez un écran pour voir son contenu"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              {selectedScreen ? (
                assignedContent ? (
                  <div className="aspect-video bg-muted flex items-center justify-center overflow-hidden">
                    {assignedContent.type === 'image' ? (
                      <img 
                        src={assignedContent.url} 
                        alt={assignedContent.name} 
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground p-8">
                        <MonitorPlay size={64} className="mb-4" />
                        <h3 className="text-xl font-medium mb-2">{assignedContent.name}</h3>
                        <p className="text-center max-w-md">
                          {assignedContent.type === 'video' && "Vidéo en cours de lecture"}
                          {assignedContent.type === 'powerpoint' && "Présentation PowerPoint"}
                          {assignedContent.type === 'pdf' && "Document PDF"}
                          {assignedContent.type === 'html' && "Page HTML"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground p-8">
                    <MonitorPlay size={64} className="mb-4" />
                    <h3 className="text-xl font-medium mb-2">Aucun contenu</h3>
                    <p className="text-center max-w-md">
                      Aucun contenu n'est actuellement assigné à cet écran.
                      Utilisez la section "Écrans" ou "Contenus" pour assigner du contenu.
                    </p>
                  </div>
                )
              ) : (
                <div className="aspect-video bg-muted flex flex-col items-center justify-center text-muted-foreground p-8">
                  <MonitorPlay size={64} className="mb-4" />
                  <h3 className="text-xl font-medium mb-2">Sélectionnez un écran</h3>
                  <p className="text-center max-w-md">
                    Veuillez sélectionner un écran dans le panneau de gauche
                    pour prévisualiser son contenu.
                  </p>
                </div>
              )}
            </CardContent>
            {selectedScreen && assignedContent && (
              <CardFooter className="border-t p-4">
                <div className="w-full flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h4 className="font-medium">{assignedContent.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Type: {assignedContent.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2" onClick={handleRefresh} disabled={isRefreshing}>
                      <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                      Rafraîchir
                    </Button>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
        
        {screens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tous les écrans</CardTitle>
              <CardDescription>
                Vue d'ensemble de tous les écrans configurés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {screens.map((screen) => {
                    const content = screen.contentId 
                      ? contents.find(c => c.id === screen.contentId)
                      : undefined;
                    
                    return (
                      <Card key={screen.id} className="overflow-hidden">
                        <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                          {content?.type === 'image' ? (
                            <img 
                              src={content.url} 
                              alt={content.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MonitorPlay size={32} className="text-muted-foreground" />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{screen.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {screen.ipAddress}:{screen.port}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div 
                                  className={`w-2 h-2 rounded-full ${
                                    screen.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                                  }`} 
                                />
                                <p className="text-xs">
                                  {screen.status === 'online' ? 'En ligne' : 'Hors ligne'}
                                </p>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setSelectedScreenId(screen.id)}
                            >
                              <ExternalLink size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PreviewPage;
