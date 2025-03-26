
import React from 'react';
import { Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface RefreshIntervalSliderProps {
  refreshIntervalValue: number;
  setRefreshIntervalValue: (value: number) => void;
}

export const RefreshIntervalSlider: React.FC<RefreshIntervalSliderProps> = ({
  refreshIntervalValue,
  setRefreshIntervalValue
}) => {
  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center gap-2">
        <Clock size={18} className="text-primary" />
        <Label>Intervalle de rafraîchissement des aperçus (minutes)</Label>
      </div>
      
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">1 minute</span>
          <span className="font-semibold">{refreshIntervalValue} minute{refreshIntervalValue > 1 ? 's' : ''}</span>
          <span className="text-sm text-muted-foreground">60 minutes</span>
        </div>
        
        <Slider
          value={[refreshIntervalValue]}
          min={1}
          max={60}
          step={1}
          onValueChange={(value) => setRefreshIntervalValue(value[0])}
        />
        
        <p className="text-sm text-muted-foreground">
          Fréquence de vérification de l'état des écrans sur la page d'aperçu (synchronisé avec le champ en secondes).
        </p>
      </div>
    </div>
  );
};
