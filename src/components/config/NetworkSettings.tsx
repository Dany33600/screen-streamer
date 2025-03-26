
import React, { useState } from 'react';
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

export const NetworkSettings = () => {
  const basePort = useAppStore((state) => state.basePort);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const setBasePort = useAppStore((state) => state.setBasePort);
  const setBaseIpAddress = useAppStore((state) => state.setBaseIpAddress);
  
  const [portValue, setPortValue] = useState(basePort.toString());
  const [ipValue, setIpValue] = useState(baseIpAddress);
  const [isSaving, setIsSaving] = useState(false);
  
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
