
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
  // États pour les différentes phases du processus
  const [isChecking, setIsChecking] = useState(false);
  const [checkPassed, setCheckPassed] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Récupération des fonctions et valeurs depuis le store
  const setHasAttemptedServerCheck = useAppStore((state) => state.setHasAttemptedServerCheck);
  const setHasCompletedOnboarding = useAppStore((state) => state.setHasCompletedOnboarding);
  const saveConfig = useAppStore((state) => state.saveConfig);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiPort = useAppStore((state) => state.apiPort);
  const apiIpAddress = useAppStore((state) => state.apiIpAddress);
  const useBaseIpForApi = useAppStore((state) => state.useBaseIpForApi);
  
  const setApiPort = useAppStore((state) => state.setApiPort);
  const setUseBaseIpForApi = useAppStore((state) => state.setUseBaseIpForApi);
  const setApiIpAddress = useAppStore((state) => state.setApiIpAddress);
  
  // États locaux pour les champs du formulaire
  const [apiPortValue, setApiPortValue] = useState(apiPort.toString());
  const [apiIpValue, setApiIpValue] = useState(useBaseIpForApi ? baseIpAddress : apiIpAddress);
  const [useBaseIpValue, setUseBaseIpValue] = useState(useBaseIpForApi);
  
  // IP à utiliser pour la connexion
  const ipToUse = useBaseIpValue ? baseIpAddress : apiIpValue;
  
  // Mise à jour de l'IP de l'API si on utilise la même que le serveur web
  useEffect(() => {
    if (useBaseIpValue) {
      setApiIpValue(baseIpAddress);
    }
  }, [baseIpAddress, useBaseIpValue]);
  
  // Fonction pour tester la connexion au serveur API
  const handleCheckServer = async () => {
    // Validation des entrées
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
    
    // Mise à jour des valeurs dans le store
    setApiPort(newApiPort);
    setUseBaseIpForApi(useBaseIpValue);
    if (!useBaseIpValue) {
      setApiIpAddress(apiIpValue);
    }
    
    // Mise à jour de l'URL de l'API dans le service
    configService.updateApiBaseUrl({
      baseIpAddress: baseIpAddress,
      apiPort: newApiPort,
      apiIpAddress: useBaseIpValue ? baseIpAddress : apiIpValue,
      useBaseIpForApi: useBaseIpValue
    });
    
    // Démarrage du test de connexion
    setIsChecking(true);
    setCheckPassed(null);
    
    try {
      console.log(`Vérification du serveur API: ${ipToUse}:${newApiPort}`);
      
      const result = await checkApiServerStatus({ 
        ipAddress: ipToUse, 
        port: newApiPort 
      });
      
      console.log(`Résultat de la vérification:`, result);
      setCheckPassed(result.serverRunning);
      
      if (result.serverRunning) {
        toast.success('Connexion réussie', {
          description: 'La connexion au serveur a été établie avec succès.'
        });
      } else {
        toast.error('Échec de la connexion', {
          description: 'Le serveur API n\'est pas accessible. Assurez-vous qu\'il est bien démarré.'
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
  
  // Fonction pour continuer sans serveur (si le test échoue)
  const handleContinueWithoutServer = () => {
    console.log('Continuer sans serveur - début');
    setHasCompletedOnboarding(true);
    
    toast.warning('Passage au tableau de bord', {
      description: 'Vous pourrez configurer la connexion au serveur plus tard dans les paramètres.'
    });
    
    console.log('Continuer sans serveur - appel à onComplete');
    onComplete();
  };
  
  // Fonction pour sauvegarder la configuration
  const handleSaveConfig = async () => {
    console.log('Sauvegarde de la configuration - début');
    setIsSaving(true);
    
    try {
      console.log('Tentative de sauvegarde de la configuration');
      const configSaved = await saveConfig();
      
      if (configSaved) {
        toast.success('Configuration sauvegardée', {
          description: 'La configuration a été enregistrée sur le serveur.'
        });
        
        console.log('Configuration sauvegardée, marquage de l\'onboarding terminé');
        setHasCompletedOnboarding(true);
        
        console.log('Appel à onComplete pour terminer');
        onComplete();
      } else {
        toast.error('Erreur de sauvegarde', {
          description: 'Impossible de sauvegarder la configuration sur le serveur.'
        });
        
        // Si la sauvegarde échoue, permettre de continuer quand même
        console.log('Échec de la sauvegarde, affichage du bouton pour continuer sans sauvegarde');
        setIsSaving(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      
      toast.error('Erreur', {
        description: 'Une erreur est survenue lors de la sauvegarde de la configuration.'
      });
      
      setIsSaving(false);
    }
  };
  
  // Fonction pour continuer sans sauvegarder
  const handleContinueWithoutSave = () => {
    console.log('Continuer sans sauvegarde - début');
    setHasCompletedOnboarding(true);
    
    toast.warning('Passage au tableau de bord sans sauvegarde', {
      description: 'Vous pourrez configurer la connexion au serveur plus tard dans les paramètres.'
    });
    
    console.log('Continuer sans sauvegarde - appel à onComplete');
    onComplete();
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Vérification du serveur</h2>
        <p className="text-muted-foreground">
          Configurez et vérifiez la connexion au serveur API.
        </p>
      </div>
      
      {/* ÉTAPE 1: Configuration du serveur API */}
      <div className="space-y-4 border-b pb-4">
        <h3 className="font-medium">1. Configuration du serveur API</h3>
        
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
      
      {/* ÉTAPE 2: Rappel de démarrage du serveur */}
      <div className="border-b pb-4">
        <h3 className="font-medium mb-3">2. Démarrez le serveur API</h3>
        <p className="text-sm text-muted-foreground mb-2">
          Avant de continuer, assurez-vous que votre serveur backend API est démarré.
        </p>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          <p className="font-medium">Rappel :</p>
          <p>Pour démarrer le serveur API, exécutez la commande dans un terminal :</p>
          <code className="block p-2 mt-1 bg-yellow-100 rounded text-xs">
            node src/server.js
          </code>
        </div>
      </div>
      
      {/* ÉTAPE 3: Test de connexion */}
      <div className="border-b pb-4">
        <h3 className="font-medium mb-3">3. Vérifiez la connexion</h3>
        <div className="p-4 border rounded-lg flex flex-col items-center justify-center space-y-4 bg-card/50">
          {checkPassed === null ? (
            <div className="text-center py-2">
              <p className="mb-2">
                Adresse du serveur API: <strong>{ipToUse}:{apiPortValue}</strong>
              </p>
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
                {isChecking ? 'Vérification en cours...' : 'Tester la connexion'}
              </Button>
            </div>
          ) : checkPassed ? (
            <div className="text-center py-2 space-y-3">
              <CheckCircle className="h-14 w-14 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-green-500">Connexion réussie</h3>
              <p>Le serveur API est accessible et opérationnel.</p>
              <Button onClick={handleCheckServer} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tester à nouveau
              </Button>
            </div>
          ) : (
            <div className="text-center py-2 space-y-3">
              <XCircle className="h-14 w-14 text-red-500 mx-auto" />
              <h3 className="text-xl font-semibold text-red-500">Échec de la connexion</h3>
              <p>Le serveur API n'est pas accessible. Vérifiez qu'il est bien démarré et que les paramètres sont corrects.</p>
              <Button onClick={handleCheckServer} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Tester à nouveau
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* ÉTAPE 4: Actions basées sur le résultat du test */}
      {checkPassed !== null && (
        <div className="border-b pb-4">
          <h3 className="font-medium mb-3">4. Action</h3>
          <div className="p-4 border rounded-lg text-center bg-card/50">
            {checkPassed ? (
              <>
                <p className="mb-4">La connexion est établie. Voulez-vous sauvegarder la configuration et terminer?</p>
                {!isSaving ? (
                  <Button 
                    onClick={handleSaveConfig}
                    className="gap-2"
                    variant="success"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Sauvegarder et terminer
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      disabled
                      className="gap-2"
                      variant="success"
                    >
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Sauvegarde en cours...
                    </Button>
                    
                    <div className="mt-2">
                      <Button 
                        onClick={handleContinueWithoutSave}
                        className="gap-2"
                        variant="outline"
                      >
                        <ArrowRight className="h-4 w-4" />
                        Continuer sans sauvegarder
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="mb-4">La connexion a échoué. Voulez-vous continuer sans serveur?</p>
                <Button 
                  onClick={handleContinueWithoutServer}
                  className="gap-2"
                  variant="default"
                >
                  <ArrowRight className="h-4 w-4" />
                  Continuer sans serveur
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Bouton de retour toujours visible */}
      <div className="pt-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> 
          Retour
        </Button>
      </div>
    </div>
  );
};

export default StepServerCheck;
