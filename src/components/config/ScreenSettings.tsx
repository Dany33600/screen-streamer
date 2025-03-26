
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ScreenSettingsToggles } from './screens/ScreenSettingsToggles';
import { RefreshIntervalSlider } from './screens/RefreshIntervalSlider';

export const ScreenSettings = () => {
  const refreshInterval = useAppStore((state) => state.refreshInterval);
  const setRefreshInterval = useAppStore((state) => state.setRefreshInterval);
  
  // Initialiser les valeurs depuis le store
  const [refreshIntervalValue, setRefreshIntervalValue] = useState(refreshInterval);
  
  const handleSaveScreenSettings = () => {
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
        <ScreenSettingsToggles />
        
        <RefreshIntervalSlider 
          refreshIntervalValue={refreshIntervalValue}
          setRefreshIntervalValue={setRefreshIntervalValue}
        />
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
