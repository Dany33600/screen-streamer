import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { 
  Settings, 
  Network, 
  MonitorPlay, 
  Save, 
  RefreshCw, 
  AlertTriangle,
  LockKeyhole,
  Check
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ConfigPage = () => {
  const navigate = useNavigate();
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const configPin = useAppStore((state) => state.configPin);
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isPinSaved, setIsPinSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  
  // Stronger redirection check - immediately redirect if not in config mode
  useEffect(() => {
    if (!isConfigMode) {
      console.log("Redirecting: Not in config mode");
      navigate('/', { replace: true });
      toast({
        title: "Accès restreint",
        description: "Vous devez être en mode configuration pour accéder à cette page",
        variant: "destructive",
      });
    }
  }, [isConfigMode, navigate]);

  // When config mode changes, ensure we're on the general tab
  useEffect(() => {
    if (activeTab === "network") {
      console.log("Resetting tab to general");
      setActiveTab("general");
    }
  }, [isConfigMode, activeTab]);
  
  // Listen for changes to the URL to ensure we don't stay on restricted page
  useEffect(() => {
    const checkAccess = () => {
      if (!isConfigMode && window.location.pathname === '/config') {
        console.log("URL check redirecting to home");
        navigate('/', { replace: true });
      }
    };
    
    checkAccess();
    window.addEventListener('popstate', checkAccess);
    
    return () => {
      window.removeEventListener('popstate', checkAccess);
    };
  }, [isConfigMode, navigate]);
  
  const getLocalIpAddress = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ],
      });
      
      pc.createDataChannel('finder');
      
      await pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          pc.onicecandidate = null;
          pc.close();
          reject(new Error("Délai d'attente dépassé pour la détection d'IP"));
        }, 5000);
        
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate) return;
          
          const { candidate } = ice.candidate;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
          const matches = ipRegex.exec(candidate);
          
          if (matches && matches[1]) {
            const ip = matches[1];
            if (ip.startsWith('192.168.') || ip.startsWith('10.') || 
                (ip.startsWith('172.') && parseInt(ip.split('.')[1], 10) >= 16 && parseInt(ip.split('.')[1], 10) <= 31)) {
              clearTimeout(timeout);
              pc.onicecandidate = null;
              pc.close();
              resolve(ip);
            }
          }
        };
      });
    } catch (error) {
      console.error('Erreur lors de la détection de l\'adresse IP:', error);
      throw error;
    }
  };
  
  const getFallbackIpAddress = () => {
    return baseIpAddress;
  };
  
  const handleSaveNetworkConfig = () => {
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
    
    setIsSaving(true);
    
    setTimeout(() => {
      setBasePort(newPort);
      setBaseIpAddress(ipValue);
      setIsSaving(false);
      toast({
        title: 'Configuration réseau mise à jour',
      });
    }, 500);
  };
  
  const detectNetworkSettings = async () => {
    setIsSaving(true);
    
    try {
      let detectedIp;
      
      try {
        detectedIp = await getLocalIpAddress();
      } catch (error) {
        console.log("Erreur avec la méthode principale:", error);
        toast({
          title: 'La méthode principale de détection a échoué',
          description: 'Utilisation de la méthode alternative',
        });
        detectedIp = getFallbackIpAddress();
      }
      
      if (detectedIp) {
        setIpValue(detectedIp);
        toast({
          title: 'Adresse IP locale détectée: ' + detectedIp,
        });
      } else {
        toast({
          title: "Détection impossible",
          description: "Impossible de détecter l'adresse IP automatiquement. Veuillez l'entrer manuellement.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur finale:', error);
      toast({
        title: "Détection d'IP impossible",
        description: "Veuillez vérifier votre connexion réseau.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      setConfigPin(newPin);
      setIsPinSaved(true);
      toast({
        title: 'Code PIN mis à jour',
        description: 'Votre nouveau code PIN a été enregistré',
      });
      
      setTimeout(() => {
        setIsPinSaved(false);
      }, 2000);
    }
  };

  const renderServerInformation = () => (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Information sur le serveur web</CardTitle>
        <CardDescription>
          Configuration du serveur web pour les écrans
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Pour utiliser les écrans externes, vous devez démarrer le serveur backend avec la commande suivante :
          </AlertDescription>
        </Alert>
        
        <div className="bg-muted p-4 rounded-md text-sm font-mono overflow-x-auto">
          node src/server.js
        </div>
        
        <p className="text-sm text-muted-foreground">
          Ce serveur démarrera sur le port 5000 par défaut et permettra à vos écrans d'être accessibles via leurs ports respectifs.
          Assurez-vous que ces ports sont ouverts dans votre pare-feu.
        </p>
        
        <div className="grid gap-2">
          <Label>Adresse IP actuelle</Label>
          <div className="flex items-center gap-2">
            <Input
              value={ipValue}
              disabled
              className="bg-muted"
            />
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={detectNetworkSettings}
            >
              <RefreshCw size={16} />
              Détecter
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Les écrans seront accessibles à l'adresse : <span className="font-medium">{ipValue}:[PORT]</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const handleTabChange = (value: string) => {
    // If trying to access network tab but not in config mode, prevent it
    if (value === "network" && !isConfigMode) {
      toast({
        title: "Accès restreint",
        description: "Vous devez être en mode configuration pour accéder à cette section",
        variant: "destructive",
      });
      return;
    }
    
    setActiveTab(value);
  };

  // Early return if not in config mode
  if (!isConfigMode) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Paramètres de l'application et des écrans
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Settings size={16} />
              Général
            </TabsTrigger>
            
            {isConfigMode && (
              <TabsTrigger value="network" className="gap-2">
                <Network size={16} />
                Réseau
              </TabsTrigger>
            )}
            
            <TabsTrigger value="screens" className="gap-2">
              <MonitorPlay size={16} />
              Écrans
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez les paramètres de base de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Mode configuration</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer pour modifier les écrans et les paramètres
                    </p>
                  </div>
                  <Switch
                    checked={isConfigMode}
                    disabled={true}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rotation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Faire tourner les contenus dans les playlists
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
            
            {isConfigMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LockKeyhole size={20} />
                    Sécurité
                  </CardTitle>
                  <CardDescription>
                    Configurez le code PIN pour accéder au mode configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code PIN à 4 chiffres</Label>
                    <div className="flex justify-center my-4">
                      <InputOTP
                        maxLength={4}
                        value={newPin}
                        onChange={setNewPin}
                        render={({ slots }) => (
                          <InputOTPGroup className="gap-3">
                            {slots.map((slot, index) => (
                              <InputOTPSlot key={index} {...slot} index={index} className="h-12 w-12 text-lg" />
                            ))}
                          </InputOTPGroup>
                        )}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Ce code sera demandé pour accéder au mode configuration
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleSavePin} 
                    disabled={newPin.length !== 4 || isPinSaved}
                    className="w-full mt-4"
                  >
                    {isPinSaved ? <Check className="mr-2" size={16} /> : null}
                    {isPinSaved ? "Code PIN enregistré" : "Enregistrer le code PIN"}
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Thème sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Utiliser un thème sombre pour l'interface
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres réseau</CardTitle>
                <CardDescription>
                  Configurez les paramètres réseau pour vos écrans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ip-address">Adresse IP du serveur</Label>
                  <Input
                    id="ip-address"
                    placeholder="192.168.0.1"
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
                
                <div className="flex items-center gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={detectNetworkSettings}
                    disabled={isSaving}
                  >
                    <RefreshCw size={16} className={isSaving ? "animate-spin" : ""} />
                    Détecter
                  </Button>
                  <Button 
                    className="gap-2"
                    onClick={handleSaveNetworkConfig}
                    disabled={isSaving}
                  >
                    <Save size={16} />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {renderServerInformation()}
            
            <Card>
              <CardHeader>
                <CardTitle>Avancé</CardTitle>
                <CardDescription>
                  Paramètres réseau avancés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Serveur HTTPS</Label>
                    <p className="text-sm text-muted-foreground">
                      Utiliser HTTPS pour la diffusion (nécessite un certificat)
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compression</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer la compression des données envoyées
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="screens" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres des écrans</CardTitle>
                <CardDescription>
                  Configurez les options par défaut pour tous les écrans
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rotation automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Rotation automatique des contenus pour tous les écrans
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Plein écran</Label>
                    <p className="text-sm text-muted-foreground">
                      Afficher le contenu en plein écran sur les navigateurs clients
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cache local</Label>
                    <p className="text-sm text-muted-foreground">
                      Mettre en cache les contenus sur les clients pour un chargement plus rapide
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                
                <div className="grid gap-2 pt-4">
                  <Label htmlFor="refresh-interval">Intervalle de rafraîchissement (secondes)</Label>
                  <Input
                    id="refresh-interval"
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                    min="5"
                  />
                  <p className="text-sm text-muted-foreground">
                    Intervalle de temps entre chaque vérification de contenu mis à jour
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-2">
                  <Save size={16} />
                  Enregistrer les paramètres
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConfigPage;

