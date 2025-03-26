
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export const ScreenSettingsToggles: React.FC = () => {
  return (
    <>
      <div className="flex items-center justify-between opacity-65">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label>Rotation automatique</Label>
            <Badge variant="outline" className="bg-[#F1F0FB] text-[#8A898C] border-[#C8C8C9]">
              En développement
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Rotation automatique des contenus pour tous les écrans
          </p>
        </div>
        <Switch defaultChecked={true} disabled />
      </div>
      
      <div className="flex items-center justify-between opacity-65">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label>Plein écran</Label>
            <Badge variant="outline" className="bg-[#F1F0FB] text-[#8A898C] border-[#C8C8C9]">
              En développement
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Afficher le contenu en plein écran sur les navigateurs clients
          </p>
        </div>
        <Switch defaultChecked={true} disabled />
      </div>
      
      <div className="flex items-center justify-between opacity-65">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label>Cache local</Label>
            <Badge variant="outline" className="bg-[#F1F0FB] text-[#8A898C] border-[#C8C8C9]">
              En développement
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Mettre en cache les contenus sur les clients pour un chargement plus rapide
          </p>
        </div>
        <Switch defaultChecked={true} disabled />
      </div>
    </>
  );
};
