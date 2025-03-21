
import React, { useRef, useState } from 'react';
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
import { ContentType } from '@/types';
import { FileUp, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useContentUpload } from '@/hooks/use-content-upload';
import { useAppStore } from '@/store';

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileURL, setSelectedFileURL] = useState<string>('');
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState<ContentType>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadContent, isLoading } = useContentUpload();
  const addContent = useAppStore(state => state.addContent);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFileURL(url);
    setContentName(file.name);
    
    // Auto-detect content type
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
      setContentType('image');
    } else if (['mp4', 'webm', 'ogg', 'mov'].includes(extension)) {
      setContentType('video');
    } else if (['ppt', 'pptx'].includes(extension)) {
      setContentType('powerpoint');
    } else if (extension === 'pdf') {
      setContentType('pdf');
    } else if (['html', 'htm'].includes(extension)) {
      setContentType('html');
    }
  };
  
  const resetContentForm = () => {
    setSelectedFile(null);
    setSelectedFileURL('');
    setContentName('');
    setContentType('image');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAddContent = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    
    if (contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return;
    }
    
    try {
      const result = await uploadContent(selectedFile, contentType);
      
      if (!result.success || !result.url) {
        toast.error(`Erreur lors de l'upload: ${result.error}`);
        return;
      }
      
      // Add to store with the URL from server
      addContent(selectedFile, contentType, result.url);
      resetContentForm();
      onOpenChange(false);
      toast.success(`Contenu "${contentName}" ajouté avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contenu:', error);
      toast.error('Une erreur est survenue lors de l\'ajout du contenu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetContentForm();
      onOpenChange(newOpen);
    }}>
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
                      setSelectedFile(null);
                      setSelectedFileURL('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={14} />
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*,video/*,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/html"
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
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type de contenu</Label>
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
          <Button variant="outline" onClick={() => {
            resetContentForm();
            onOpenChange(false);
          }}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddContent} 
            disabled={!selectedFile || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Importation en cours...
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
