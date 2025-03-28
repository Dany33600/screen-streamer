
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { AlertTriangle, RefreshCw, Save, Network } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { serverManagementService } from '@/services/server/serverManagementService';

export const NetworkSettings = () => {
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [isSaving, setIsSaving] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
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
    setIsDetecting(true);
    
    try {
      // Essayer d'abord de récupérer via l'API du serveur
      if (apiUrl) {
        try {
          const response = await fetch(`${apiUrl}/api/network/ip`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.ipAddress) {
              setIpValue(data.ipAddress);
              toast({
                title: 'Adresse IP locale détectée: ' + data.ipAddress,
              });
              setIsDetecting(false);
              return;
            }
          }
        } catch (error) {
          console.log("Erreur lors de la récupération de l'IP via l'API:", error);
        }
      }
      
      // Méthode alternative basée sur le serveur d'API
      try {
        console.log("Tentative de détection via les entêtes HTTP...");
        
        // Envoyer une requête à l'API pour récupérer l'IP via les en-têtes de requête
        const apiUrl = useAppStore.getState().apiUrl;
        
        if (apiUrl) {
          const response = await fetch(`${apiUrl}/api/ping`);
          
          if (response.ok) {
            const data = await response.json();
            if (data.clientIp) {
              setIpValue(data.clientIp);
              toast({
                title: 'Adresse IP détectée via l\'API: ' + data.clientIp,
              });
              setIsDetecting(false);
              return;
            }
          }
        }
      } catch (serverError) {
        console.log("Erreur lors de la récupération via l'API:", serverError);
      }
      
      // Méthode avec WebRTC comme fallback
      try {
        const candidateIps = await getLocalIpAddressesWithWebRTC();
        if (candidateIps.length > 0) {
          setIpValue(candidateIps[0]);
          toast({
            title: 'Adresse IP locale détectée: ' + candidateIps[0],
          });
          return;
        }
      } catch (webRTCError) {
        console.log("Erreur avec WebRTC:", webRTCError);
      }
      
      // Dernière tentative: essayer d'obtenir l'IP directement depuis le serveur express
      try {
        if (serverManagementService && apiUrl) {
          const serverIp = await serverManagementService.getServerIpAddress();
          if (serverIp) {
            setIpValue(serverIp);
            toast({
              title: 'Adresse IP du serveur détectée: ' + serverIp,
            });
            return;
          }
        }
      } catch (error) {
        console.log("Erreur avec le service de gestion de serveur:", error);
      }
      
      toast({
        title: "Détection automatique impossible",
        description: "Impossible de détecter l'adresse IP automatiquement. Veuillez l'entrer manuellement.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erreur finale:', error);
      toast({
        title: "Détection d'IP impossible",
        description: "Veuillez vérifier votre connexion réseau.",
        variant: "destructive",
      });
    } finally {
      setIsDetecting(false);
    }
  };
  
  // Fonction pour récupérer les adresses IP locales via WebRTC
  const getLocalIpAddressesWithWebRTC = (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      // Créer une connexion RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Tableau pour stocker les adresses IP trouvées
      const ipAddresses: string[] = [];
      
      // Définir un timeout pour rejeter la promesse si aucune adresse n'est trouvée
      const timeout = setTimeout(() => {
        pc.close();
        if (ipAddresses.length > 0) {
          resolve(ipAddresses);
        } else {
          reject(new Error('Timeout lors de la recherche des adresses IP'));
        }
      }, 5000);
      
      // Événement pour récupérer les candidats ICE
      pc.onicecandidate = (event) => {
        if (!event || !event.candidate) return;
        
        const candidate = event.candidate.candidate;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const match = ipRegex.exec(candidate);
        
        if (match) {
          const ip = match[1];
          
          // Filtrer pour ne garder que les adresses IP locales
          if (
            (ip.startsWith('192.168.') || ip.startsWith('10.') || 
             (ip.startsWith('172.') && parseInt(ip.split('.')[1]) >= 16 && parseInt(ip.split('.')[1]) <= 31)) &&
            !ipAddresses.includes(ip)
          ) {
            ipAddresses.push(ip);
          }
        }
      };
      
      // Créer une offre pour déclencher la collecte de candidats
      pc.createDataChannel('ipDetection');
      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(error => {
          clearTimeout(timeout);
          pc.close();
          reject(error);
        });
    });
  };
  
  // Détecter l'IP au chargement du composant
  useEffect(() => {
    if (!baseIpAddress || baseIpAddress === '127.0.0.1' || baseIpAddress === 'localhost') {
      detectNetworkSettings();
    }
  }, []);

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
              onChange={(e) => setIpValue(e.target.value)}
              className="bg-muted"
            />
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={detectNetworkSettings}
              disabled={isDetecting}
            >
              <RefreshCw size={16} className={isDetecting ? "animate-spin" : ""} />
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

  return (
    <>
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
              disabled={isSaving || isDetecting}
            >
              <RefreshCw size={16} className={isDetecting ? "animate-spin" : ""} />
              Détecter
            </Button>
            <Button 
              className="gap-2"
              onClick={handleSaveNetworkConfig}
              disabled={isSaving || isDetecting}
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
          <CardTitle className="flex items-center gap-2">
            Avancé
            <Badge variant="outline" className="bg-[#F1F0FB] text-[#8A898C] border-[#C8C8C9]">
              En développement
            </Badge>
          </CardTitle>
          <CardDescription>
            Paramètres réseau avancés
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 opacity-65">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Serveur HTTPS</Label>
              <p className="text-sm text-muted-foreground">
                Utiliser HTTPS pour la diffusion (nécessite un certificat)
              </p>
            </div>
            <Switch defaultChecked={false} disabled />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compression</Label>
              <p className="text-sm text-muted-foreground">
                Activer la compression des données envoyées
              </p>
            </div>
            <Switch defaultChecked={true} disabled />
          </div>
        </CardContent>
      </Card>
    </>
  );
};
