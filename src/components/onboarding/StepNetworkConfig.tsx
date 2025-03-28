
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { configService } from '@/services/config/configService';
import { Checkbox } from '@/components/ui/checkbox';

interface StepNetworkConfigProps {
  onNext: () => void;
  onBack: () => void;
}

const StepNetworkConfig: React.FC<StepNetworkConfigProps> = ({ onNext, onBack }) => {
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  const setApiPort = useAppStore((state) => state.setApiPort);
  const setUseBaseIpForApi = useAppStore((state) => state.setUseBaseIpForApi);
  const setApiIpAddress = useAppStore((state) => state.setApiIpAddress);
  
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [apiPortValue, setApiPortValue] = useState(apiPort.toString());
  const [apiIpValue, setApiIpValue] = useState(apiIpAddress);
  const [useBaseIpValue, setUseBaseIpValue] = useState(useBaseIpForApi);
  
  const handleNext = () => {
    const newPort = parseInt(portValue, 10);
    const newApiPort = parseInt(apiPortValue, 10);
    
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      toast({
        title: 'Veuillez entrer un numéro de port valide (1-65535)',
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(newApiPort) || newApiPort < 1 || newApiPort > 65535) {
      toast({
        title: 'Veuillez entrer un numéro de port API valide (1-65535)',
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
    
    if (!useBaseIpValue && !ipPattern.test(apiIpValue)) {
      toast({
        title: 'Veuillez entrer une adresse IP API valide',
        variant: "destructive",
      });
      return;
    }
    
    setBasePort(newPort);
    setBaseIpAddress(ipValue);
    setApiPort(newApiPort);
    setUseBaseIpForApi(useBaseIpValue);
    
    if (useBaseIpValue) {
      setApiIpAddress(ipValue);
    } else {
      setApiIpAddress(apiIpValue);
    }
    
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
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">Configuration du serveur API</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="use-base-ip" 
              checked={useBaseIpValue}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;
                setUseBaseIpValue(isChecked);
                if (isChecked) {
                  setApiIpValue(ipValue);
                }
              }}
            />
            <Label 
              htmlFor="use-base-ip"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Utiliser la même adresse IP que le serveur web
            </Label>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="api-ip-address">Adresse IP du serveur API</Label>
            <Input
              id="api-ip-address"
              placeholder="192.168.0.14"
              value={useBaseIpValue ? ipValue : apiIpValue}
              onChange={(e) => setApiIpValue(e.target.value)}
              disabled={useBaseIpValue}
            />
            <p className="text-sm text-muted-foreground">
              L'adresse IP du serveur API backend
            </p>
          </div>
          
          <div className="grid gap-2 mt-3">
            <Label htmlFor="api-port">Port du serveur API</Label>
            <Input
              id="api-port"
              placeholder="5070"
              value={apiPortValue}
              onChange={(e) => setApiPortValue(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Le port sur lequel le serveur API backend fonctionnera
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

export default StepNetworkConfig;
