
import React, { useState } from 'react';
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
import { screenServerService } from '@/services/screenServerReal';
import DisplayOptionsDialog from '@/components/screens/DisplayOptionsDialog';

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
  const getScreenById = (id: string) => screens.find(screen => screen.id === id);
  const [isDisplayOptionsOpen, setIsDisplayOptionsOpen] = useState(false);
  const [pendingScreenId, setPendingScreenId] = useState<string | null>(null);

  const handleAssignContent = async () => {
    if (!content || !selectedScreenId) return;
    
    const screen = getScreenById(selectedScreenId);
    if (!screen) return;
    
    // Sauvegarder l'ancien contentId pour vérifier si le contenu a changé
    const previousContentId = screen.contentId;
    
    // Assigner le nouveau contenu
    assignContentToScreen(selectedScreenId, content.id);
    
    // Vérifier si le serveur est en cours d'exécution
    const isServerRunning = screenServerService.isServerRunning(selectedScreenId);
    
    // Si le contenu a changé et que le serveur est en cours d'exécution
    if (isServerRunning && previousContentId !== content.id) {
      // Demander à l'utilisateur de configurer les options d'affichage
      setPendingScreenId(selectedScreenId);
      setIsDisplayOptionsOpen(true);
    } else {
      // Fermer le dialogue d'assignation
      onOpenChange(false);
      toast.success('Contenu assigné à l\'écran avec succès');
    }
  };
  
  const handleConfirmDisplayOptions = async (displayOptions: any) => {
    if (!pendingScreenId || !content) return;
    
    const screen = getScreenById(pendingScreenId);
    if (!screen) return;
    
    console.log(`Mise à jour du serveur pour l'écran ${screen.name} avec le nouveau contenu ${content.name}`);
    console.log(`Options d'affichage:`, displayOptions);
    
    const success = await screenServerService.updateServer(pendingScreenId, screen.port, content, displayOptions);
    
    if (success) {
      toast.success(`Le serveur pour l'écran "${screen.name}" a été mis à jour avec le nouveau contenu.`);
    } else {
      toast.error(`Impossible de mettre à jour le serveur pour l'écran "${screen.name}".`);
    }
    
    // Réinitialiser les états
    setPendingScreenId(null);
    onOpenChange(false);
  };

  const noScreens = screens.length === 0;
  const serverNotConfigured = !apiUrl || apiUrl === '';

  return (
    <>
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
            <Alert variant="destructive" className="mb-4">
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
      
      {content && (
        <DisplayOptionsDialog
          open={isDisplayOptionsOpen}
          onOpenChange={setIsDisplayOptionsOpen}
          content={content}
          onConfirm={handleConfirmDisplayOptions}
          initialOptions={pendingScreenId ? screenServerService.getServerInstance(pendingScreenId)?.displayOptions : undefined}
        />
      )}
    </>
  );
};

export default AssignContentDialog;
