
import React, { useState } from 'react';
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
import { toast } from 'sonner';

interface AddScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScreen: (name: string) => Promise<void>;
  isLoading: boolean;
}

const AddScreenDialog: React.FC<AddScreenDialogProps> = ({
  open,
  onOpenChange,
  onAddScreen,
  isLoading
}) => {
  const [screenName, setScreenName] = useState('');

  const handleAddScreen = async () => {
    if (screenName.trim() === '') {
      toast.error('Le nom de l\'écran ne peut pas être vide');
      return;
    }
    
    await onAddScreen(screenName);
    setScreenName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un écran</DialogTitle>
          <DialogDescription>
            Configurez un nouvel écran pour diffuser du contenu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de l'écran</Label>
            <Input
              id="name"
              placeholder="Ex: Écran d'accueil"
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
          <Button onClick={handleAddScreen} disabled={isLoading}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddScreenDialog;
