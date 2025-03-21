
import React, { useState, useEffect } from 'react';
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
import { Screen, Content } from '@/types';
import { toast } from '@/hooks/use-toast';

interface AssignContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  contents: Content[];
  onAssignContent: (screenId: string, contentId?: string) => void;
}

export const AssignContentDialog: React.FC<AssignContentDialogProps> = ({
  open,
  onOpenChange,
  screen,
  contents,
  onAssignContent,
}) => {
  const [selectedContentId, setSelectedContentId] = useState<string>('none');

  useEffect(() => {
    if (screen) {
      setSelectedContentId(screen.contentId || 'none');
    }
  }, [screen]);

  const handleAssignContent = () => {
    if (!screen) return;
    
    const contentId = selectedContentId === 'none' ? undefined : selectedContentId;
    
    onAssignContent(screen.id, contentId);
    onOpenChange(false);
    toast({
      title: 'Contenu assigné avec succès',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner du contenu</DialogTitle>
          <DialogDescription>
            Choisissez le contenu à diffuser sur l'écran {screen?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="content">Contenu</Label>
            <Select 
              value={selectedContentId} 
              onValueChange={setSelectedContentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un contenu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun contenu</SelectItem>
                {contents.map((content) => (
                  <SelectItem key={content.id} value={content.id}>
                    {content.name}
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
          <Button onClick={handleAssignContent}>Assigner</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
