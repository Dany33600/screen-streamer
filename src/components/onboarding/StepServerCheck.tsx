
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, ServerCrash, Loader2, Server } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { API_PORT } from '@/config/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepServerCheckProps {
  onComplete: () => void;
  onBack: () => void;
}

const StepServerCheck: React.FC<StepServerCheckProps> = ({ onComplete, onBack }) => {
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const setApiPort = useAppStore((state) => state.setApiPort);
  const setHasAttemptedServerCheck = useAppStore((state) => state.setHasAttemptedServerCheck);
  
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [isLoading, setIsLoading] = useState(false);
  const [apiPortValue, setApiPortValue] = useState(apiPort.toString());
  
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
    
    // Mettre à jour le port API dans le store
    setApiPort(newPort);
    
    try {
      // Marquer que nous avons tenté de vérifier le serveur
      setHasAttemptedServerCheck(true);
      
      // Essayer de se connecter au serveur
      const apiUrl = `http://${baseIpAddress}:${newPort}/api/ping`;
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
  
  useEffect(() => {
    // Vérifier le serveur au chargement, mais avec un court délai
    const timer = setTimeout(() => {
      checkServerStatus();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleComplete = () => {
    onComplete();
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Vérification du serveur</h2>
        <p className="text-muted-foreground">
          Vérifions que votre serveur API est accessible.
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="api-port">Port du serveur API</Label>
          <Input
            id="api-port"
            value={apiPortValue}
            onChange={(e) => setApiPortValue(e.target.value)}
            placeholder={API_PORT.toString()}
          />
          <p className="text-sm text-muted-foreground">
            Port utilisé par le serveur API backend
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={checkServerStatus} 
            disabled={isLoading} 
            variant="outline"
            className="gap-2"
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
          
          <div className="flex items-center gap-2 ml-2">
            {serverStatus === 'checking' && (
              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
            )}
            {serverStatus === 'online' && (
              <Check className="w-5 h-5 text-green-500" />
            )}
            {serverStatus === 'offline' && (
              <ServerCrash className="w-5 h-5 text-red-500" />
            )}
            
            <span>
              {serverStatus === 'checking' && "Vérification en cours..."}
              {serverStatus === 'online' && "Serveur en ligne"}
              {serverStatus === 'offline' && "Serveur hors ligne"}
            </span>
          </div>
        </div>
        
        {serverStatus === 'offline' && (
          <Alert variant="destructive">
            <AlertDescription>
              Le serveur API n'est pas accessible. Assurez-vous que le serveur est démarré avec la commande <code>node src/server.js</code> et que le port {apiPortValue} est accessible.
            </AlertDescription>
          </Alert>
        )}
        
        {serverStatus === 'online' && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              Connexion au serveur réussie. Vous pouvez maintenant accéder au dashboard.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} /> Retour
        </Button>
        <Button 
          onClick={handleComplete} 
          className="gap-2"
          disabled={isLoading}
        >
          Terminer
        </Button>
      </div>
    </div>
  );
};

export default StepServerCheck;
