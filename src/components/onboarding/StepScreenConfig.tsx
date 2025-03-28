
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface StepScreenConfigProps {
  onNext: () => void;
  onBack: () => void;
}

const StepScreenConfig: React.FC<StepScreenConfigProps> = ({ onNext, onBack }) => {
  const setRefreshInterval = useAppStore((state) => state.setRefreshInterval);
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  
  const [refreshValue, setRefreshValue] = useState(refreshInterval);
  
  const handleNext = () => {
    setRefreshInterval(refreshValue);
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuration des écrans</h2>
        <p className="text-muted-foreground">
          Définissez les paramètres globaux pour tous vos écrans.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-primary" />
            <Label>Intervalle de rafraîchissement des aperçus (minutes)</Label>
          </div>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">1 minute</span>
              <span className="font-semibold">{refreshValue} minute{refreshValue > 1 ? 's' : ''}</span>
              <span className="text-sm text-muted-foreground">60 minutes</span>
            </div>
            
            <Slider
              value={[refreshValue]}
              min={1}
              max={60}
              step={1}
              onValueChange={(value) => setRefreshValue(value[0])}
            />
            
            <p className="text-sm text-muted-foreground">
              Fréquence de vérification de l'état des écrans sur la page d'aperçu.
            </p>
          </div>
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

export default StepScreenConfig;
