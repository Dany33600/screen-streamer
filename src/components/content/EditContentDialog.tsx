
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Content, ContentType } from '@/types';
import { toast } from 'sonner';
import { useAppStore } from '@/store';

interface EditContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Content | null;
  contentName: string;
  setContentName: (name: string) => void;
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  fileURL: string;
}

const EditContentDialog: React.FC<EditContentDialogProps> = ({
  open,
  onOpenChange,
  content,
  contentName,
  setContentName,
  contentType,
  setContentType,
  fileURL
}) => {
  const updateContent = useAppStore(state => state.updateContent);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Récupérer le contenu HTML au chargement du composant ou lorsque le contenu change
  useEffect(() => {
    const fetchHtmlContent = async () => {
      if (content && content.type === 'html' && content.url) {
        try {
          setIsLoading(true);
          const baseUrl = window.location.origin;
          const url = content.url.startsWith('http') ? content.url : `${baseUrl}${content.url}`;
          
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
          }
          
          const html = await response.text();
          setHtmlContent(html);
        } catch (error) {
          console.error('Erreur lors de la récupération du contenu HTML:', error);
          toast.error('Impossible de charger le contenu HTML');
        } finally {
          setIsLoading(false);
        }
      } else if (content && content.htmlContent) {
        setHtmlContent(content.htmlContent);
      }
    };

    if (open && content) {
      fetchHtmlContent();
    }
  }, [open, content]);

  const handleUpdateContent = async () => {
    if (!content) return;
    
    if (contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return;
    }
    
    try {
      const updatedContent: Partial<Content> = { 
        name: contentName,
        type: contentType
      };
      
      // Ajouter le contenu HTML si c'est un fichier HTML
      if (contentType === 'html') {
        updatedContent.htmlContent = htmlContent;
        
        // Appel à l'API pour mettre à jour le contenu HTML sur le serveur
        const baseIpAddress = useAppStore.getState().baseIpAddress;
        const apiUrl = useAppStore.getState().getApiUrl().replace('localhost', baseIpAddress);
        
        const response = await fetch(`${apiUrl}/content/${content.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: {
              ...updatedContent,
              id: content.id,
              htmlContent: htmlContent
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du contenu HTML');
        }
      }
      
      updateContent(content.id, updatedContent);
      onOpenChange(false);
      toast.success('Contenu mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du contenu');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le contenu</DialogTitle>
          <DialogDescription>
            Modifiez les informations du contenu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {fileURL && contentType === 'image' && (
            <div className="mt-2 h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
              <img src={fileURL} alt="Preview" className="max-h-full object-contain" />
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
                <SelectItem value="google-slides">URL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {contentType === 'html' && (
            <div className="space-y-2">
              <Label htmlFor="edit-html-content">Contenu HTML</Label>
              {isLoading ? (
                <div className="flex items-center justify-center h-40 bg-muted rounded-md">
                  Chargement du contenu HTML...
                </div>
              ) : (
                <Textarea
                  id="edit-html-content"
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Éditez le contenu HTML ici..."
                />
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleUpdateContent}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditContentDialog;
