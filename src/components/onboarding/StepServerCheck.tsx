
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, RefreshCw, ServerCrash, Terminal } from 'lucide-react';
import { API_PORT } from '@/config/constants';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StepServerCheckProps {
  onComplete: () => void;
  onBack: () => void;
}

const StepServerCheck: React.FC<StepServerCheckProps> = ({ onComplete, onBack }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unchecked' | 'online' | 'offline'>('unchecked');
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  const checkServerStatus = async () => {
    setIsChecking(true);
    setServerStatus('unchecked');
    
    try {
      const response = await fetch(`http://${baseIpAddress}:${API_PORT}/api/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Adding a timeout to the fetch request
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du serveur:', error);
      setServerStatus('offline');
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Vérification du serveur</h2>
        <p className="text-muted-foreground">
          Pour terminer la configuration, veuillez démarrer le serveur backend et vérifier sa connexion.
        </p>
      </div>
      
      <Alert className="bg-muted">
        <Terminal className="h-4 w-4" />
        <AlertDescription>
          Avant de continuer, démarrez le serveur backend avec la commande suivante dans un terminal:
        </AlertDescription>
      </Alert>
      
      <div className="bg-black text-white p-4 rounded-md font-mono text-sm overflow-x-auto">
        node src/server.js
      </div>
      
      <div className={`p-6 border rounded-lg ${
        serverStatus === 'online' 
          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
          : serverStatus === 'offline'
            ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'
            : 'bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-900'
      }`}>
        <div className="flex items-center gap-3">
          {serverStatus === 'online' ? (
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          ) : serverStatus === 'offline' ? (
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ServerCrash className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Terminal className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          )}
          
          <div>
            <h3 className="font-medium">
              {serverStatus === 'online' 
                ? 'Serveur en ligne !' 
                : serverStatus === 'offline'
                  ? 'Serveur hors ligne'
                  : 'Statut du serveur inconnu'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {serverStatus === 'online' 
                ? `Le serveur est accessible à l'adresse http://${baseIpAddress}:${API_PORT}` 
                : serverStatus === 'offline'
                  ? "Impossible de se connecter au serveur. Vérifiez qu'il est bien démarré."
                  : "Cliquez sur le bouton pour vérifier l'état du serveur"}
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} /> Retour
        </Button>
        
        {serverStatus === 'online' ? (
          <Button onClick={onComplete} className="gap-2">
            Terminer la configuration <Check size={16} />
          </Button>
        ) : (
          <Button 
            onClick={checkServerStatus} 
            variant="outline" 
            disabled={isChecking}
            className="gap-2"
          >
            {isChecking ? (
              <>
                <RefreshCw size={16} className="animate-spin" /> Vérification...
              </>
            ) : (
              <>
                <RefreshCw size={16} /> Vérifier la connexion
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepServerCheck;
