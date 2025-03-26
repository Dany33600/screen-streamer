
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
import { FileUp, X, Loader2, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useContentUpload } from '@/hooks/use-content-upload';
import { useAppStore } from '@/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { v4 as uuidv4 } from 'uuid';

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // États existants
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileURL, setSelectedFileURL] = useState<string>('');
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState<ContentType>('image');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadContent, isLoading } = useContentUpload();
  const addContent = useAppStore(state => state.addContent);
  const apiUrl = useAppStore(state => state.apiUrl);
  const baseIpAddress = useAppStore(state => state.baseIpAddress);
  
  // Nouvel état pour l'onglet actif et l'URL Google Slides
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file');
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string>('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFileURL(url);
    setContentName(file.name);
    setUploadError(null);
    
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
    setUploadError(null);
    setGoogleSlidesUrl('');
    setActiveTab('file');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleAddContent = async () => {
    if (activeTab === 'file') {
      if (!selectedFile) {
        toast.error("Veuillez sélectionner un fichier");
        return;
      }
      
      if (contentName.trim() === '') {
        toast.error("Le nom du contenu ne peut pas être vide");
        return;
      }
      
      try {
        setUploadError(null);
        console.log("Starting upload process with API URL:", apiUrl);
        
        const result = await uploadContent(selectedFile, contentType);
        
        if (!result.success || !result.url) {
          setUploadError(`Erreur lors de l'upload: ${result.error}`);
          toast.error(`Échec de l'upload: ${result.error}`);
          return;
        }
        
        // Add to store with the URL and contentId from server
        addContent(selectedFile, contentType, result.url, result.contentId);
        
        resetContentForm();
        onOpenChange(false);
        toast.success(`Contenu "${contentName}" ajouté avec succès`);
      } catch (error) {
        console.error('Erreur lors de l\'ajout du contenu:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setUploadError(errorMessage);
        toast.error('Une erreur est survenue lors de l\'ajout du contenu');
      }
    } else {
      // Gestion de l'ajout par lien Google Slides
      if (!googleSlidesUrl) {
        toast.error("Veuillez entrer une URL Google Slides");
        return;
      }
      
      // Vérification basique du format URL Google Slides
      if (!isValidGoogleSlidesUrl(googleSlidesUrl)) {
        toast.error("L'URL ne semble pas être une URL Google Slides valide");
        return;
      }
      
      if (contentName.trim() === '') {
        toast.error("Le nom du contenu ne peut pas être vide");
        return;
      }
      
      try {
        setUploadError(null);
        
        // Préparation du lien d'intégration Google Slides
        const embeddableUrl = convertToEmbeddableGoogleSlidesUrl(googleSlidesUrl);
        
        // Générer un ID unique pour ce contenu
        const contentId = uuidv4();
        
        // Ajouter au store sans télécharger de fichier
        const newContent = {
          id: contentId,
          name: contentName,
          type: 'google-slides' as ContentType,
          url: embeddableUrl,
          createdAt: Date.now()
        };
        
        // Enregistrer dans le store
        addContent(null, 'google-slides', embeddableUrl, contentId, newContent);
        
        resetContentForm();
        onOpenChange(false);
        toast.success(`Présentation "${contentName}" ajoutée avec succès`);
      } catch (error) {
        console.error('Erreur lors de l\'ajout de la présentation Google Slides:', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
        setUploadError(errorMessage);
        toast.error('Une erreur est survenue lors de l\'ajout de la présentation');
      }
    }
  };

  // Format the display URL to show the actual IP being used
  const getDisplayApiUrl = () => {
    if (!apiUrl) return "Non configurée";
    return apiUrl.replace('localhost', baseIpAddress);
  };

  // Fonction pour vérifier si l'URL est une URL Google Slides valide
  const isValidGoogleSlidesUrl = (url: string): boolean => {
    return url.includes('docs.google.com/presentation') || 
           url.includes('drive.google.com') || 
           url.includes('slides.google.com');
  };

  // Fonction pour convertir l'URL Google Slides en URL embarquable
  const convertToEmbeddableGoogleSlidesUrl = (url: string): string => {
    // Format de base pour une URL intégrable
    let embeddableUrl = url;
    
    // Si l'URL est un lien de partage standard, convertir en format embarquable
    if (url.includes('docs.google.com/presentation/d/')) {
      // Extraire l'ID de la présentation
      const matches = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (matches && matches[1]) {
        const presentationId = matches[1];
        embeddableUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?start=false&loop=true&delayms=3000`;
      }
    }
    
    return embeddableUrl;
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
            Ajoutez un fichier ou un lien à diffuser sur vos écrans
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'file' | 'link')} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="file">Fichier</TabsTrigger>
              <TabsTrigger value="link">Lien</TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-4">
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
                          setUploadError(null);
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
            </TabsContent>
            
            <TabsContent value="link" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slides-url">URL Google Slides</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slides-url"
                    placeholder="https://docs.google.com/presentation/d/..."
                    value={googleSlidesUrl}
                    onChange={(e) => setGoogleSlidesUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={googleSlidesUrl ? "visible" : "invisible"}
                    onClick={() => setGoogleSlidesUrl('')}
                  >
                    <X size={14} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Entrez l'URL d'une présentation Google Slides partagée (accessible au moins en lecture)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="link-name"
                  placeholder="Nom de la présentation"
                  value={contentName}
                  onChange={(e) => setContentName(e.target.value)}
                />
              </div>
              
              <Alert className="mt-4">
                <LinkIcon className="h-4 w-4 mr-2" />
                <AlertDescription>
                  Assurez-vous que la présentation soit partagée publiquement ou accessible à toute personne ayant le lien.
                </AlertDescription>
              </Alert>
            </TabsContent>
          </Tabs>
          
          <div className="text-sm text-muted-foreground mt-2">
            API URL: {getDisplayApiUrl()}
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
            disabled={(activeTab === 'file' && !selectedFile) || 
                     (activeTab === 'link' && !googleSlidesUrl) || 
                     isLoading}
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
