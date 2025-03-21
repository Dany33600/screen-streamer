
import React from 'react';
import { Screen } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssignContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  screens: Screen[];
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  onAssign: () => void;
}

const AssignContentDialog: React.FC<AssignContentDialogProps> = ({
  isOpen,
  onOpenChange,
  screens,
  selectedScreenId,
  setSelectedScreenId,
  onAssign
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner à un écran</DialogTitle>
          <DialogDescription>
            Choisissez l'écran sur lequel diffuser ce contenu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="screen">Écran</Label>
            <Select value={selectedScreenId} onValueChange={setSelectedScreenId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un écran" />
              </SelectTrigger>
              <SelectContent>
                {screens.map((screen) => (
                  <SelectItem key={screen.id} value={screen.id}>
                    {screen.name} ({screen.ipAddress}:{screen.port})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onAssign} disabled={!selectedScreenId}>Assigner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignContentDialog;
