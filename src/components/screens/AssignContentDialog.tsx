
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Screen, Content } from '@/types';
import ContentTypeIcon from '../content/ContentTypeIcon';
import ContentSelectionComponent from '../content/ContentSelectionComponent';

interface AssignContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screen: Screen | null;
  selectedContentId: string;
  setSelectedContentId: (id: string) => void;
  screens: Screen[];
  contents: Content[];
  onAssignContent: () => Promise<void>;
}

const AssignContentDialog = ({
  open,
  onOpenChange,
  screen,
  selectedContentId,
  setSelectedContentId,
  screens,
  contents,
  onAssignContent
}: AssignContentDialogProps) => {
  const [isAssigning, setIsAssigning] = useState(false);
  const [localSelectedContentId, setLocalSelectedContentId] = useState(selectedContentId);
  
  // Update local state when props change
  useEffect(() => {
    setLocalSelectedContentId(selectedContentId);
  }, [selectedContentId]);
  
  const handleSelectContent = (contentId: string) => {
    setLocalSelectedContentId(contentId);
  };
  
  const handleAssign = async () => {
    if (!screen) return;
    
    setIsAssigning(true);
    try {
      await onAssignContent();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning content:', error);
    } finally {
      setIsAssigning(false);
    }
  };
  
  const selectedContent = localSelectedContentId !== 'none' 
    ? contents.find(content => content.id === localSelectedContentId)
    : null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assigner du contenu à l'écran</DialogTitle>
        </DialogHeader>
        
        {screen ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <h3 className="font-medium text-lg mb-1">Écran: {screen.name}</h3>
              <p className="text-sm text-muted-foreground">
                {screen.ipAddress}:{screen.port}
              </p>
            </div>
            
            <div className="space-y-4">
              <Label>Sélectionnez un contenu</Label>
              <Select 
                value={localSelectedContentId} 
                onValueChange={handleSelectContent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contenu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun contenu</SelectItem>
                  {contents.map(content => (
                    <SelectItem key={content.id} value={content.id} className="flex items-center">
                      {content.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedContent && (
                <div className="p-3 border rounded-md bg-muted/10 flex items-center">
                  <ContentTypeIcon type={selectedContent.type} className="h-8 w-8 mr-3" />
                  <div>
                    <p className="font-medium">{selectedContent.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedContent.type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Aucun écran sélectionné
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssign}
            disabled={!screen || isAssigning}
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assignation...
              </>
            ) : (
              'Assigner'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignContentDialog;
