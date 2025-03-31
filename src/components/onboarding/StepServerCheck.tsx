import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, RefreshCw, XCircle, ArrowRight } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { checkApiServerStatus } from '@/utils/server-status';
import { configService } from '@/services/config/configService';

interface StepServerCheckProps {
  onComplete: () => void;
  onBack: () => void;
}

const StepServerCheck: React.FC<StepServerCheckProps> = ({ onComplete, onBack }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkPassed, setCheckPassed] = useState<boolean | null>(null);
  const [ipReachable, setIpReachable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const setHasAttemptedServerCheck = useAppStore((state) => state.setHasAttemptedServerCheck);
  const saveConfig = useAppStore((state) => state.saveConfig);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  
  const setApiPort = useAppStore((state) => state.setApiPort);
  const setUseBaseIpForApi = useAppStore((state) => state.setUseBaseIpForApi);
  const setApiIpAddress = useAppStore((state) => state.setApiIpAddress);
  
  const [apiPortValue, setApiPortValue] = useState(apiPort.toString());
  const [apiIpValue, setApiIpValue] = useState(useBaseIpForApi ? baseIpAddress : apiIpAddress);
  const [useBaseIpValue, setUseBaseIpValue] = useState(useBaseIpForApi);
  
  useEffect(() => {
    if (useBaseIpValue) {
      setApiIpValue(baseIpAddress);
    }
  }, [baseIpAddress, useBaseIpValue]);
  
  const ipToUse = useBaseIpValue ? baseIpAddress : apiIpValue;
  
  const handleCheckServer = async () => {
    // Validate inputs first
    const newApiPort = parseInt(apiPortValue, 10);
    if (isNaN(newApiPort) || newApiPort < 1 || newApiPort > 65535) {
      toast.error('Veuillez entrer un numéro de port API valide (1-65535)');
      return;
    }
    
    if (!useBaseIpValue) {
      const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipPattern.test(apiIpValue)) {
        toast.error('Veuillez entrer une adresse IP API valide');
        return;
      }
    }
    
    // Save the API configuration
    setApiPort(newApiPort);
    setUseBaseIpForApi(useBaseIpValue);
    if (!useBaseIpValue) {
      setApiIpAddress(apiIpValue);
    }
    
    // Update API URL configuration in configService
    configService.updateApiBaseUrl({
      baseIpAddress: baseIpAddress,
      apiPort: newApiPort,
      apiIpAddress: useBaseIpValue ? baseIpAddress : apiIpValue,
      useBaseIpForApi: useBaseIpValue
    });
    
    setIsChecking(true);
    setCheckPassed(null);
    setIpReachable(null);
    
    try {
      const result = await checkApiServerStatus({ 
        ipAddress: ipToUse, 
        port: newApiPort 
      });
      
      setIpReachable(result.ipReachable);
      setCheckPassed(result.serverRunning);
      
      if (result.serverRunning) {
        toast.success('Connexion réussie', {
          description: 'La connexion au serveur a été établie avec succès.'
        });
      } else {
        toast.error('Échec de la connexion', {
          description: result.ipReachable 
            ? 'L\'API du serveur n\'est pas accessible.'
            : 'L\'adresse IP n\'est pas accessible sur le réseau.'
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du serveur:', error);
      setCheckPassed(false);
      
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la vérification du serveur.'
      });
    } finally {
      setIsChecking(false);
      setHasAttemptedServerCheck(true);
    }
  };
  
  const handleComplete = async () => {
    // On s'assure que le serveur est bien accessible avant de terminer l'onboarding
    if (checkPassed) {
      try {
        setIsSaving(true);
        // Sauvegarde finale de la configuration seulement lors de la finalisation
        const configSaved = await saveConfig();
        
        if (configSaved) {
          toast.success('Configuration sauvegardée', {
            description: 'La configuration a été enregistrée sur le serveur.'
          });
          // On redirige directement sans délai
          onComplete();
        } else {
          toast.error('Erreur', {
            description: 'Une erreur est survenue lors de la sauvegarde de la configuration.'
          });
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde de la configuration:', error);
        toast.error('Erreur', {
          description: 'Une erreur est survenue lors de la sauvegarde de la configuration.'
        });
      } finally {
        setIsSaving(false);
      }
    } else if (checkPassed === false) {
      toast.error('Erreur', {
        description: 'Veuillez vérifier la connexion avec le serveur avant de terminer.'
      });
    } else {
      toast.warning('Attention', {
        description: 'Veuillez tester la connexion au serveur d\'abord.'
      });
    }
  };

  const handleSkipToMain = () => {
    toast.warning('Passage au tableau de bord', {
      description: 'Vous pourrez configurer la connexion au serveur plus tard dans les paramètres.'
    });
    onComplete();
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Vérification du serveur</h2>
        <p className="text-muted-foreground">
          Vérifions que le serveur est accessible sur le réseau.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h3 className="font-medium mb-3">Configuration du serveur API</h3>
          
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="use-base-ip" 
              checked={useBaseIpValue}
              onCheckedChange={(checked) => {
                const isChecked = checked === true;
                setUseBaseIpValue(isChecked);
                if (isChecked) {
                  setApiIpValue(baseIpAddress);
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
              value={useBaseIpValue ? baseIpAddress : apiIpValue}
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
        
        <div className="p-4 border rounded-lg flex flex-col items-center justify-center space-y-4 bg-card/50">
          {checkPassed === null ? (
            <div className="text-center py-2">
              <p className="mb-2">
                Adresse du serveur API: <strong>{ipToUse}:{apiPortValue}</strong>
              </p>
              <p className="mb-3">Cliquez sur le bouton ci-dessous pour vérifier la connexion au serveur.</p>
              <Button 
                onClick={handleCheckServer}
                disabled={isChecking}
                className="gap-2"
              >
                {isChecking ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isChecking ? 'Vérification en cours...' : 'Vérifier la connexion'}
              </Button>
            </div>
          ) : checkPassed ? (
            <div className="text-center py-2 space-y-3">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-green-500">Connexion réussie</h3>
              <p>Le serveur est accessible et opérationnel.</p>
              <Button onClick={handleCheckServer} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tester à nouveau
              </Button>
            </div>
          ) : (
            <div className="text-center py-2 space-y-3">
              <XCircle className="h-14 w-14 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold text-red-500">Échec de la connexion</h3>
              {ipReachable === false ? (
                <p>L'adresse IP <strong>{ipToUse}</strong> n'est pas accessible sur le réseau.</p>
              ) : (
                <p>L'API du serveur sur <strong>{ipToUse}:{apiPortValue}</strong> n'est pas accessible.</p>
              )}
              <div className="space-y-2">
                <Button onClick={handleCheckServer} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tester à nouveau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft size={16} /> Retour
        </Button>
        
        {checkPassed && (
          <Button 
            onClick={handleComplete}
            className="gap-2"
            variant="success"
            disabled={isSaving}
          >
            {isSaving ? 'Finalisation...' : 'Terminer'}
          </Button>
        )}
        
        {checkPassed === false && (
          <Button 
            onClick={handleSkipToMain}
            className="gap-2"
            variant="default"
          >
            <ArrowRight size={16} /> Continuer sans serveur
          </Button>
        )}
        
        {checkPassed === null && (
          <Button 
            onClick={handleSkipToMain}
            className="gap-2"
            variant="outline"
          >
            <ArrowRight size={16} /> Ignorer cette étape
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepServerCheck;
