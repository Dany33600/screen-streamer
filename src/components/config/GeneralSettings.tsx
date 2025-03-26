
import React, { useState } from 'react';
import { useAppStore } from '@/store';
import { Moon, Sun } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/theme/ThemeProvider';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Check, LockKeyhole } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const GeneralSettings = () => {
  const isConfigMode = useAppStore((state) => state.isConfigMode);
  const configPin = useAppStore((state) => state.configPin);
  const setConfigPin = useAppStore((state) => state.setConfigPin);
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [newPin, setNewPin] = useState('');
  const [isPinSaved, setIsPinSaved] = useState(false);
  
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

  return (
    <>
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
    </>
  );
};
