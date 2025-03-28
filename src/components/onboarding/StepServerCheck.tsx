
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Check, ServerCrash, Loader2, Server } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { API_PORT } from '@/config/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface StepServerCheckProps {
  onComplete: () => void;
  onBack: () => void;
}

const StepServerCheck: React.FC<StepServerCheckProps> = ({ onComplete, onBack }) => {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const setApiPort = useAppStore((state) => state.setApiPort);
  const setUseBaseIpForApi = useAppStore((state) => state.setUseBaseIpForApi);
  const setApiIpAddress = useAppStore((state) => state.setApiIpAddress);
  const setHasAttemptedServerCheck = useAppStore((state) => state.setHasAttemptedServerCheck);
  const hasAttemptedServerCheck = useAppStore((state) => state.hasAttemptedServerCheck);
  
  const [serverStatus, setServerStatus] = useState<'initial' | 'checking' | 'online' | 'offline'>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [apiPortValue, setApiPortValue] = useState(apiPort.toString());
  const [apiIpValue, setApiIpValue] = useState(useBaseIpForApi ? baseIpAddress : apiIpAddress);
  
  // Mettre à jour l'IP API lorsque baseIpAddress change et que useBaseIpForApi est true
  useEffect(() => {
    if (useBaseIpForApi) {
      setApiIpValue(baseIpAddress);
    }
  }, [baseIpAddress, useBaseIpForApi]);
  
  useEffect(() => {
    console.log("StepServerCheck - État initial hasAttemptedServerCheck:", hasAttemptedServerCheck);
    
    // Assurons-nous que cet état est correctement initialisé au montage du composant
    return () => {
      console.log("StepServerCheck - Démontage du composant");
    };
  }, [hasAttemptedServerCheck]);
  
  const checkServerStatus = async () => {
    setIsLoading(true);
    setServerStatus('checking');
    
    const newPort = parseInt(apiPortValue, 10);
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      toast({
        title: 'Veuillez entrer un numéro de port valide (1-65535)',
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Vérifier si l'IP API est valide
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(apiIpValue)) {
      toast({
        title: 'Veuillez entrer une adresse IP valide pour le serveur API',
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Mettre à jour le port API et l'IP API dans le store
    setApiPort(newPort);
    if (useBaseIpForApi) {
      // Si l'option est activée, on utilise l'IP de base
      setApiIpAddress(baseIpAddress);
    } else {
      // Sinon, on utilise l'IP saisie par l'utilisateur
      setApiIpAddress(apiIpValue);
    }
    
    try {
      // Marquer que nous avons tenté de vérifier le serveur - IMPORTANT pour activer le logo cliquable
      setHasAttemptedServerCheck(true);
      console.log("Vérification serveur tentée - hasAttemptedServerCheck défini à true");
      
      // Essayer de se connecter au serveur avec l'IP appropriée
      const serverIp = useBaseIpForApi ? baseIpAddress : apiIpValue;
      const apiUrl = `http://${serverIp}:${newPort}/api/ping`;
      console.log(`Vérification du serveur à l'adresse: ${apiUrl}`);
      
      const response = await fetch(apiUrl, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000) // Timeout après 5 secondes
      });
      
      if (response.ok) {
        setServerStatus('online');
        toast({
          title: 'Connexion au serveur réussie',
        });
        // Redirection automatique après une connexion réussie et un délai
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setServerStatus('offline');
        toast({
          title: 'Impossible de se connecter au serveur',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du serveur:', error);
      setServerStatus('offline');
      toast({
        title: 'Serveur inaccessible',
        description: 'Vérifiez que le serveur est démarré et accessible',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Vérification du serveur</h2>
        <p className="text-muted-foreground text-sm">
          Pour terminer la configuration, veuillez démarrer le serveur backend et vérifier sa connexion.
        </p>
      </div>
      
      <ScrollArea className="h-[360px] pr-4">
        <div className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="use-base-ip" 
                checked={useBaseIpForApi}
                onCheckedChange={(checked) => {
                  setUseBaseIpForApi(checked === true);
                  if (checked) {
                    setApiIpValue(baseIpAddress);
                  }
                }}
              />
              <Label 
                htmlFor="use-base-ip"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Utiliser la même adresse IP que le serveur web ({baseIpAddress})
              </Label>
            </div>
            
            <Label htmlFor="api-ip" className="text-sm">Adresse IP du serveur API</Label>
            <Input
              id="api-ip"
              value={apiIpValue}
              onChange={(e) => setApiIpValue(e.target.value)}
              disabled={useBaseIpForApi}
              placeholder={baseIpAddress}
              className="h-8"
            />
            <p className="text-xs text-muted-foreground">
              Adresse IP utilisée par le serveur API backend
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="api-port" className="text-sm">Port du serveur API</Label>
            <Input
              id="api-port"
              value={apiPortValue}
              onChange={(e) => setApiPortValue(e.target.value)}
              placeholder={API_PORT.toString()}
              className="h-8"
            />
            <p className="text-xs text-muted-foreground">
              Port utilisé par le serveur API backend
            </p>
          </div>

          <Alert className="bg-muted py-2">
            <div className="flex items-center gap-2">
              <div className="shrink-0 text-muted-foreground">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                  <path d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2.02502 11.72 2.02502 13.5999C2.02502 13.8623 2.23769 14.0749 2.50002 14.0749C2.76236 14.0749 2.97502 13.8623 2.97502 13.5999C2.97502 11.8799 3.42786 10.7206 4.17091 9.9883C4.91536 9.25463 6.02674 8.87499 7.49995 8.87499C8.97317 8.87499 10.0846 9.25463 10.8291 9.98831C11.5721 10.7206 12.025 11.8799 12.025 13.5999C12.025 13.8623 12.2376 14.0749 12.5 14.0749C12.7623 14.0749 12.975 13.8623 12.975 13.5999C12.975 11.72 12.4778 10.2794 11.4959 9.31166C10.7244 8.55135 9.70025 8.12903 8.50625 7.98352C10.0187 7.5474 11.125 6.15289 11.125 4.5C11.125 2.49797 9.50203 0.875 7.5 0.875ZM4.825 4.5C4.825 3.02264 6.02264 1.825 7.5 1.825C8.97736 1.825 10.175 3.02264 10.175 4.5C10.175 5.97736 8.97736 7.175 7.5 7.175C6.02264 7.175 4.825 5.97736 4.825 4.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
              <AlertDescription className="text-xs">
                Avant de continuer, démarrez le serveur backend avec la commande suivante:
              </AlertDescription>
            </div>
          </Alert>
          
          <div className="bg-black p-2 rounded-md text-white text-xs font-mono overflow-x-auto">
            node src/server.js
          </div>
          
          {serverStatus === 'offline' && (
            <Alert variant="destructive" className="py-2">
              <ServerCrash className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Serveur hors ligne. Impossible de se connecter au serveur. Vérifiez qu'il est bien démarré.
              </AlertDescription>
            </Alert>
          )}
          
          {serverStatus === 'online' && (
            <Alert className="py-2">
              <Check className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Connexion au serveur réussie. Vous allez être redirigé vers le dashboard...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>
      
      <div className="pt-2 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2 text-sm h-9">
          <ArrowLeft size={14} /> Retour
        </Button>
        <Button 
          onClick={checkServerStatus} 
          disabled={isLoading}
          className="gap-2 text-sm h-9"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Vérification...
            </>
          ) : (
            <>
              <Server className="w-4 h-4" />
              Vérifier la connexion
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepServerCheck;
