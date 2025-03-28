
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { configService } from '@/services/config/configService';

interface StepNetworkConfigProps {
  onNext: () => void;
  onBack: () => void;
}

const StepNetworkConfig: React.FC<StepNetworkConfigProps> = ({ onNext, onBack }) => {
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  
  const handleNext = () => {
    const newPort = parseInt(portValue, 10);
    
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      toast({
        title: 'Veuillez entrer un numéro de port valide (1-65535)',
        variant: "destructive",
      });
      return;
    }
    
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipPattern.test(ipValue)) {
      toast({
        title: 'Veuillez entrer une adresse IP valide',
        variant: "destructive",
      });
      return;
    }
    
    setBasePort(newPort);
    setBaseIpAddress(ipValue);
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Configuration réseau</h2>
        <p className="text-muted-foreground">
          Configurez les paramètres réseau pour vos écrans.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="ip-address">Adresse IP du serveur</Label>
          <Input
            id="ip-address"
            placeholder="192.168.0.14"
            value={ipValue}
            onChange={(e) => setIpValue(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            L'adresse IP de cette machine sur le réseau local
          </p>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="base-port">Port de base</Label>
          <Input
            id="base-port"
            placeholder="5550"
            value={portValue}
            onChange={(e) => setPortValue(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Le premier port utilisé pour les écrans (incrémenté pour chaque écran)
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

export default StepNetworkConfig;
