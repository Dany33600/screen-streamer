import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import { Settings, Network, MonitorPlay, Save, RefreshCw } from 'lucide-react';

const ConfigPage = () => {
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  const toggleConfigMode = useAppStore((state) => state.toggleConfigMode);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [isSaving, setIsSaving] = useState(false);
  
  const getLocalIpAddress = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [],
      });
      
      pc.createDataChannel('');
      
      await pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      return new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          pc.onicecandidate = null;
          pc.close();
          reject(new Error("Timeout de détection d'IP"));
        }, 5000);
        
        pc.onicecandidate = (ice) => {
          if (ice.candidate) {
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            const matches = ipRegex.exec(ice.candidate.candidate);
            
            if (matches && matches[1]) {
              const ip = matches[1];
              if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
                clearTimeout(timeout);
                resolve(ip);
                pc.onicecandidate = null;
                pc.close();
              }
            }
          }
        };
      });
    } catch (error) {
      console.error('Erreur lors de la détection de l\'adresse IP:', error);
      throw error;
    }
  };
  
  const handleSaveNetworkConfig = () => {
    const newPort = parseInt(portValue, 10);
    
    if (isNaN(newPort) || newPort < 1 || newPort > 65535) {
      toast.error('Veuillez entrer un numéro de port valide (1-65535)');
      return;
    }
    
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipPattern.test(ipValue)) {
      toast.error('Veuillez entrer une adresse IP valide');
      return;
    }
    
    setIsSaving(true);
    
    setTimeout(() => {
      setBasePort(newPort);
      setBaseIpAddress(ipValue);
      setIsSaving(false);
      toast.success('Configuration réseau mise à jour');
    }, 500);
  };
  
  const detectNetworkSettings = async () => {
    setIsSaving(true);
    
    try {
      const detectedIp = await getLocalIpAddress();
      
      if (detectedIp) {
        setIpValue(detectedIp);
        toast.success('Adresse IP locale détectée: ' + detectedIp);
      } else {
        toast.warning('Impossible de détecter l\'adresse IP automatiquement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la détection de l\'adresse IP');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Paramètres de l'application et des écrans
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
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
                    onCheckedChange={toggleConfigMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Démarrage automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Démarrer l'application au démarrage du système
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
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
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer les animations dans l'interface
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
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
