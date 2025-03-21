
import React from 'react';
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
import { Content, Screen } from '@/types';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AssignContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  screens: Screen[];
}

const AssignContentDialog: React.FC<AssignContentDialogProps> = ({
  open,
  onOpenChange,
  content,
  selectedScreenId,
  setSelectedScreenId,
  screens
}) => {
  const assignContentToScreen = useAppStore(state => state.assignContentToScreen);
  const apiUrl = useAppStore(state => state.apiUrl);

  const handleAssignContent = () => {
    if (!content || !selectedScreenId) return;
    
    assignContentToScreen(selectedScreenId, content.id);
    onOpenChange(false);
    toast.success('Contenu assigné à l\'écran avec succès');
  };

  const noScreens = screens.length === 0;
  const serverNotConfigured = !apiUrl || apiUrl === '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner à un écran</DialogTitle>
          <DialogDescription>
            Choisissez l'écran sur lequel diffuser ce contenu
          </DialogDescription>
        </DialogHeader>
        
        {serverNotConfigured && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Le serveur API n'est pas configuré. Veuillez configurer l'URL de l'API dans les paramètres.
            </AlertDescription>
          </Alert>
        )}
        
        {noScreens && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Aucun écran n'est disponible. Veuillez d'abord ajouter un écran.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="screen">Écran</Label>
            <Select value={selectedScreenId} onValueChange={setSelectedScreenId} disabled={noScreens}>
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
          <Button 
            onClick={handleAssignContent} 
            disabled={!selectedScreenId || noScreens || serverNotConfigured}
          >
            Assigner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignContentDialog;
