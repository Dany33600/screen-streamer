
import React from 'react';
import { useAppStore } from '@/store';
import { 
  AlertTriangle, 
  Bug, 
  Layers, 
  MonitorPlay, 
  Film, 
  List, 
  PlaySquare 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const DebugSettings = () => {
  const menuOptions = useAppStore((state) => state.menuOptions);
  const toggleMenuOption = useAppStore((state) => state.toggleMenuOption);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug size={20} className="text-primary" />
          Débogage - Visibilité des menus
        </CardTitle>
        <CardDescription>
          Activez ou désactivez les différentes options du menu principal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-900 dark:text-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-800 dark:text-yellow-200" />
          <AlertDescription>
            Ces options permettent de contrôler la visibilité des éléments du menu principal.
            La désactivation d'une option masquera l'élément correspondant pour tous les utilisateurs.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Layers size={20} className="text-primary" />
              <div className="space-y-0.5">
                <Label>Tableau de bord</Label>
                <p className="text-sm text-muted-foreground">
                  Page d'accueil avec les statistiques et informations générales
                </p>
              </div>
            </div>
            <Switch 
              checked={menuOptions.dashboard} 
              onCheckedChange={(checked) => toggleMenuOption('dashboard', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MonitorPlay size={20} className="text-primary" />
              <div className="space-y-0.5">
                <Label>Écrans</Label>
                <p className="text-sm text-muted-foreground">
                  Gestion des écrans d'affichage et de leur contenu
                </p>
              </div>
            </div>
            <Switch 
              checked={menuOptions.screens} 
              onCheckedChange={(checked) => toggleMenuOption('screens', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film size={20} className="text-primary" />
              <div className="space-y-0.5">
                <Label>Contenus</Label>
                <p className="text-sm text-muted-foreground">
                  Gestion des médias et fichiers à afficher
                </p>
              </div>
            </div>
            <Switch 
              checked={menuOptions.content} 
              onCheckedChange={(checked) => toggleMenuOption('content', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <List size={20} className="text-primary" />
              <div className="space-y-0.5">
                <Label>Playlists</Label>
                <p className="text-sm text-muted-foreground">
                  Gestion des séquences de contenus
                </p>
              </div>
            </div>
            <Switch 
              checked={menuOptions.playlists} 
              onCheckedChange={(checked) => toggleMenuOption('playlists', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PlaySquare size={20} className="text-primary" />
              <div className="space-y-0.5">
                <Label>Aperçu</Label>
                <p className="text-sm text-muted-foreground">
                  Prévisualisation des contenus avant diffusion
                </p>
              </div>
            </div>
            <Switch 
              checked={menuOptions.preview} 
              onCheckedChange={(checked) => toggleMenuOption('preview', checked)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Note: Ces modifications sont appliquées immédiatement et conservées même après la déconnexion
        </p>
      </CardFooter>
    </Card>
  );
};
