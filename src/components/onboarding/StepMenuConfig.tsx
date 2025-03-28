
import React from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface StepMenuConfigProps {
  onNext: () => void;
  onBack: () => void;
}

const StepMenuConfig: React.FC<StepMenuConfigProps> = ({ onNext, onBack }) => {
  const menuOptions = useAppStore((state) => state.menuOptions);
  const toggleMenuOption = useAppStore((state) => state.toggleMenuOption);
  
  const handleNext = () => {
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuration des menus</h2>
        <p className="text-muted-foreground">
          Choisissez quels menus seront visibles dans l'application.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Tableau de bord</Label>
            <p className="text-sm text-muted-foreground">
              Afficher le tableau de bord principal
            </p>
          </div>
          <Switch 
            checked={menuOptions.dashboard} 
            onCheckedChange={(checked) => toggleMenuOption('dashboard', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Écrans</Label>
            <p className="text-sm text-muted-foreground">
              Gestion des écrans disponibles
            </p>
          </div>
          <Switch 
            checked={menuOptions.screens} 
            onCheckedChange={(checked) => toggleMenuOption('screens', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Contenu</Label>
            <p className="text-sm text-muted-foreground">
              Gestion du contenu à diffuser
            </p>
          </div>
          <Switch 
            checked={menuOptions.content} 
            onCheckedChange={(checked) => toggleMenuOption('content', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Playlists</Label>
            <p className="text-sm text-muted-foreground">
              Gestion des playlists et des programmations
            </p>
          </div>
          <Switch 
            checked={menuOptions.playlists} 
            onCheckedChange={(checked) => toggleMenuOption('playlists', checked)} 
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Aperçu</Label>
            <p className="text-sm text-muted-foreground">
              Aperçu en temps réel des écrans
            </p>
          </div>
          <Switch 
            checked={menuOptions.preview} 
            onCheckedChange={(checked) => toggleMenuOption('preview', checked)} 
          />
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} /> Retour
        </Button>
        <Button onClick={handleNext} className="gap-2">
          Continuer <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default StepMenuConfig;
