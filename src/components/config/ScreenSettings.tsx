
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Clock, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export const ScreenSettings = () => {
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  const setRefreshInterval = useAppStore((state) => state.setRefreshInterval);
  
  const [refreshIntervalValue, setRefreshIntervalValue] = useState(refreshInterval);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState("30");
  
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

  return (
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
  );
};
