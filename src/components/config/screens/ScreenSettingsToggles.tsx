
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const ScreenSettingsToggles: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Rotation automatique</Label>
          <p className="text-sm text-muted-foreground">
            Rotation automatique des contenus pour tous les écrans
          </p>
        </div>
        <Switch defaultChecked={true} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Plein écran</Label>
          <p className="text-sm text-muted-foreground">
            Afficher le contenu en plein écran sur les navigateurs clients
          </p>
        </div>
        <Switch defaultChecked={true} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Cache local</Label>
          <p className="text-sm text-muted-foreground">
            Mettre en cache les contenus sur les clients pour un chargement plus rapide
          </p>
        </div>
        <Switch defaultChecked={true} />
      </div>
    </>
  );
};
