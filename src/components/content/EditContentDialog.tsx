
import React from 'react';
import { ContentType } from '@/types';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  previewUrl: string;
  contentName: string;
  setContentName: (name: string) => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  onSave: () => void;
}

const EditContentDialog: React.FC<EditContentDialogProps> = ({
  isOpen,
  onOpenChange,
  previewUrl,
  contentName,
  setContentName,
  contentType,
  setContentType,
  onSave
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le contenu</DialogTitle>
          <DialogDescription>
            Modifiez les informations du contenu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {previewUrl && contentType === 'image' && (
            <div className="mt-2 h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom</Label>
            <Input
              id="edit-name"
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-type">Type de contenu</Label>
            <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
                <SelectItem value="powerpoint">PowerPoint</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentDialog;
