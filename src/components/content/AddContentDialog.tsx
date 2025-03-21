
import React, { useRef } from 'react';
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
import { FileUp, X, Loader2 } from 'lucide-react';

interface AddContentDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isUploading: boolean;
  selectedFile: File | null;
  selectedFileURL: string;
  contentName: string;
  setContentName: (name: string) => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onCancel: () => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({
  isOpen,
  onOpenChange,
  isUploading,
  selectedFile,
  selectedFileURL,
  contentName,
  setContentName,
  contentType,
  setContentType,
  onFileChange,
  onUpload,
  onCancel
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importer un contenu</DialogTitle>
          <DialogDescription>
            Ajoutez un fichier à diffuser sur vos écrans
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="file">Fichier</Label>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
                disabled={isUploading}
              >
                <FileUp size={16} />
                {selectedFile ? 'Changer de fichier' : 'Sélectionner un fichier'}
              </Button>
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      onCancel();
                    }}
                    disabled={isUploading}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={onFileChange}
                accept="image/*,video/*,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/html"
                disabled={isUploading}
              />
            </div>
          </div>
          
          {selectedFileURL && contentType === 'image' && (
            <div className="mt-4 h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <img src={selectedFileURL} alt="Preview" className="max-h-full object-contain" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              placeholder="Nom du contenu"
              value={contentName}
              onChange={(e) => setContentName(e.target.value)}
              disabled={isUploading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de contenu</Label>
            <Select value={contentType} onValueChange={(value: ContentType) => setContentType(value)} disabled={isUploading}>
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
          <Button variant="outline" onClick={onCancel} disabled={isUploading}>
            Annuler
          </Button>
          <Button onClick={onUpload} disabled={!selectedFile || isUploading}>
            {isUploading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Upload en cours...
              </>
            ) : (
              'Importer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;
