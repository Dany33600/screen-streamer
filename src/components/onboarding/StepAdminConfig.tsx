
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { DEFAULT_PIN } from '@/config/constants';

interface StepAdminConfigProps {
  onNext: () => void;
  onBack: () => void;
}

const StepAdminConfig: React.FC<StepAdminConfigProps> = ({ onNext, onBack }) => {
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  const configPin = useAppStore((state) => state.configPin);
  
  const [pinValue, setPinValue] = useState(configPin);
  const [showPin, setShowPin] = useState(false);
  
  const handleNext = () => {
    if (!pinValue.trim()) {
      toast({
        title: 'Veuillez entrer un code PIN',
        variant: "destructive",
      });
      return;
    }
    
    setConfigPin(pinValue);
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuration administrateur</h2>
        <p className="text-muted-foreground">
          Définissez un code PIN pour accéder aux paramètres administrateur.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="pin">Code PIN</Label>
          <div className="relative">
            <Input
              id="pin"
              type={showPin ? "text" : "password"}
              placeholder="Entrez votre code PIN"
              value={pinValue}
              onChange={(e) => setPinValue(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full"
              onClick={() => setShowPin(!showPin)}
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Ce code sera demandé pour accéder au mode configuration
          </p>
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

export default StepAdminConfig;
