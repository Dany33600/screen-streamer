import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { useTheme } from '@/components/theme/ThemeProvider';
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
  Check,
  Bug,
  Layers,
  Film,
  List,
  PlaySquare,
  Clock,
  Moon,
  Sun
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

const ConfigPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const configPin = useAppStore((state) => state.configPin);
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  const setRefreshInterval = useAppStore((state) => state.setRefreshInterval);
  const menuOptions = useAppStore((state) => state.menuOptions);
  const toggleMenuOption = useAppStore((state) => state.toggleMenuOption);
  
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [isPinSaved, setIsPinSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("general");
  const [refreshIntervalValue, setRefreshIntervalValue] = useState(refreshInterval);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState("30");
  
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

  useEffect(() => {
    if (!isConfigMode && activeTab === "network") {
      setActiveTab("general");
    }
  }, [isConfigMode, activeTab]);
  
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

  const handleSaveScreenSettings = () => {
    const seconds = parseInt(refreshIntervalSeconds, 10);
    
    if (isNaN(seconds) || seconds < 5) {
      toast({
        title: 'Veuillez entrer un intervalle valide (minimum 5 secondes)',
        variant: "destructive",
      });
      return;
    }
    
    setRefreshInterval(refreshIntervalValue);
    
    toast({
      title: 'Paramètres des écrans mis à jour',
      description: `Les écrans seront rafraîchis toutes les ${refreshIntervalValue} minute${refreshIntervalValue > 1 ? 's' : ''}`,
    });
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
    setActiveTab(value);
  };

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
            
            <TabsTrigger value="network" className="gap-2">
              <Network size={16} />
              Réseau
            </TabsTrigger>
            
            <TabsTrigger value="screens" className="gap-2">
              <MonitorPlay size={16} />
              Écrans
            </TabsTrigger>
            
            <TabsTrigger value="debug" className="gap-2">
              <Bug size={16} />
              Debug
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
                  <div className="space-y-0.5 flex items-center gap-2">
                    {isDarkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-yellow-500" />}
                    <div>
                      <Label>Thème sombre</Label>
                      <p className="text-sm text-muted-foreground">
                        Utiliser un thème sombre pour l'interface
                      </p>
                    </div>
                  </div>
                  <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
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
                    value={refreshIntervalSeconds}
                    onChange={(e) => setRefreshIntervalSeconds(e.target.value)}
                    min="5"
                  />
                  <p className="text-sm text-muted-foreground">
                    Intervalle de temps entre chaque vérification de contenu mis à jour
                  </p>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <Label>Intervalle de rafraîchissement des aperçus</Label>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">1 minute</span>
                      <span className="font-semibold">{refreshIntervalValue} minute{refreshIntervalValue > 1 ? 's' : ''}</span>
                      <span className="text-sm text-muted-foreground">60 minutes</span>
                    </div>
                    
                    <Slider
                      value={[refreshIntervalValue]}
                      min={1}
                      max={60}
                      step={1}
                      onValueChange={(value) => setRefreshIntervalValue(value[0])}
                    />
                    
                    <p className="text-sm text-muted-foreground">
                      Fréquence de vérification de l'état des écrans sur la page d'aperçu.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="gap-2" onClick={handleSaveScreenSettings}>
                  <Save size={16} />
                  Enregistrer les paramètres
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="debug" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug size={20} className="text-primary" />
                  Débogage - Visibilité des menus
                </CardTitle>
                <CardDescription>
                  Activez ou désactivez les différentes options du menu principal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                  <AlertTriangle className="h-4 w-4 text-yellow-800" />
                  <AlertDescription>
                    Ces options permettent de contrôler la visibilité des éléments du menu principal.
                    La désactivation d'une option masquera l'élément correspondant pour tous les utilisateurs.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Layers size={20} className="text-primary" />
                      <div className="space-y-0.5">
                        <Label>Tableau de bord</Label>
                        <p className="text-sm text-muted-foreground">
                          Page d'accueil avec les statistiques et informations générales
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={menuOptions.dashboard} 
                      onCheckedChange={(checked) => toggleMenuOption('dashboard', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MonitorPlay size={20} className="text-primary" />
                      <div className="space-y-0.5">
                        <Label>Écrans</Label>
                        <p className="text-sm text-muted-foreground">
                          Gestion des écrans d'affichage et de leur contenu
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={menuOptions.screens} 
                      onCheckedChange={(checked) => toggleMenuOption('screens', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Film size={20} className="text-primary" />
                      <div className="space-y-0.5">
                        <Label>Contenus</Label>
                        <p className="text-sm text-muted-foreground">
                          Gestion des médias et fichiers à afficher
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={menuOptions.content} 
                      onCheckedChange={(checked) => toggleMenuOption('content', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <List size={20} className="text-primary" />
                      <div className="space-y-0.5">
                        <Label>Playlists</Label>
                        <p className="text-sm text-muted-foreground">
                          Gestion des séquences de contenus
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={menuOptions.playlists} 
                      onCheckedChange={(checked) => toggleMenuOption('playlists', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <PlaySquare size={20} className="text-primary" />
                      <div className="space-y-0.5">
                        <Label>Aperçu</Label>
                        <p className="text-sm text-muted-foreground">
                          Prévisualisation des contenus avant diffusion
                        </p>
                      </div>
                    </div>
                    <Switch 
                      checked={menuOptions.preview} 
                      onCheckedChange={(checked) => toggleMenuOption('preview', checked)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Note: Ces modifications sont appliquées immédiatement et conservées même après la déconnexion
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ConfigPage;
