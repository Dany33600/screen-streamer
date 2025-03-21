
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
import { toast } from '@/hooks/use-toast';

interface AddScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddScreen: (name: string) => void;
}

export const AddScreenDialog: React.FC<AddScreenDialogProps> = ({
  open,
  onOpenChange,
  onAddScreen,
}) => {
  const [newScreenName, setNewScreenName] = useState('');

  const handleAddScreen = () => {
    if (newScreenName.trim() === '') {
      toast({
        title: 'Le nom de l\'écran ne peut pas être vide',
        variant: "destructive"
      });
      return;
    }
    
    onAddScreen(newScreenName);
    setNewScreenName('');
    onOpenChange(false);
    toast({
      title: `Écran "${newScreenName}" ajouté avec succès`,
    });
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
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleAddScreen}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
