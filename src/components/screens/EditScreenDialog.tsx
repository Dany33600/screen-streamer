
import React, { useEffect, useState } from 'react';
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
import { toast } from 'sonner';

interface EditScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateScreen: (screenId: string, name: string) => Promise<void>;
  currentScreen: Screen | null;
  isLoading: boolean;
}

const EditScreenDialog: React.FC<EditScreenDialogProps> = ({
  open,
  onOpenChange,
  onUpdateScreen,
  currentScreen,
  isLoading
}) => {
  const [screenName, setScreenName] = useState('');

  useEffect(() => {
    if (currentScreen) {
      setScreenName(currentScreen.name);
    }
  }, [currentScreen]);

  const handleUpdateScreen = async () => {
    if (!currentScreen) return;
    if (screenName.trim() === '') {
      toast.error('Le nom de l\'écran ne peut pas être vide');
      return;
    }
    
    await onUpdateScreen(currentScreen.id, screenName);
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
          <Button onClick={handleUpdateScreen} disabled={isLoading}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditScreenDialog;
