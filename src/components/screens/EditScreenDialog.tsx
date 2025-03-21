
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Screen } from '@/types';
import { toast } from '@/hooks/use-toast';

interface EditScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  onUpdateScreen: (id: string, name: string) => void;
}

export const EditScreenDialog: React.FC<EditScreenDialogProps> = ({
  open,
  onOpenChange,
  screen,
  onUpdateScreen,
}) => {
  const [screenName, setScreenName] = useState('');

  useEffect(() => {
    if (screen) {
      setScreenName(screen.name);
    }
  }, [screen]);

  const handleUpdateScreen = () => {
    if (!screen) return;
    if (screenName.trim() === '') {
      toast({
        title: 'Le nom de l\'écran ne peut pas être vide',
        variant: "destructive"
      });
      return;
    }
    
    onUpdateScreen(screen.id, screenName);
    setScreenName('');
    onOpenChange(false);
    toast({
      title: 'Écran mis à jour avec succès',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'écran</DialogTitle>
          <DialogDescription>
            Modifiez les paramètres de l'écran
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom de l'écran</Label>
            <Input
              id="edit-name"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdateScreen}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
