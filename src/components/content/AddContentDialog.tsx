import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentType } from '@/types';
import { FileUp, Link as LinkIcon, AlertTriangle, Film, Image as ImageIcon, FileText, Presentation } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useContentUpload } from '@/hooks/use-content-upload';
import { useAppStore } from '@/store';
import { toast } from 'sonner';
import DialogAlerts from './DialogAlerts';

interface AddContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({ open, onOpenChange }) => {
  const addContent = useAppStore((state) => state.addContent);
  const getApiUrl = useAppStore((state) => state.getApiUrl);
  
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [name, setName] = useState<string>("");
  const [contentType, setContentType] = useState<ContentType>("image");
  const [url, setUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const { uploadContent, isLoading } = useContentUpload();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      
      if (selectedFile.size > 50 * 1024 * 1024) {
        setFileError("Le fichier est trop volumineux (taille maximale: 50MB)");
        return;
      }
      
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name);
      }
      
      if (selectedFile.type.startsWith("image/")) {
        setContentType("image");
      } else if (selectedFile.type.startsWith("video/")) {
        setContentType("video");
      } else if (selectedFile.type.includes("pdf")) {
        setContentType("pdf");
      } else if (selectedFile.type.includes("presentation") || 
                selectedFile.type.includes("powerpoint")) {
        setContentType("powerpoint");
      } else {
        setContentType("html");
      }
    }
  };
  
  const resetForm = () => {
    setName("");
    setContentType("image");
    setUrl("");
    setFile(null);
    setFileError(null);
    setActiveTab("upload");
  };
  
  const handleSubmit = async () => {
    try {
      if (activeTab === "upload") {
        if (!file) {
          setFileError("Veuillez sélectionner un fichier");
          return;
        }
        
        const result = await uploadContent(file, contentType);
        
        if (result.success && result.url) {
          addContent(name || file.name, contentType, result.url);
          resetForm();
          onOpenChange(false);
        }
      } else if (activeTab === "url") {
        if (!url) {
          toast.error("L'URL est requise");
          return;
        }
        
        if (!name) {
          setName(`Contenu externe (${new Date().toLocaleDateString()})`);
        }
        
        addContent(name, contentType, url);
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du contenu:", error);
      toast.error("Erreur lors de l'ajout du contenu");
    }
  };
  
  const apiConfigured = Boolean(getApiUrl());
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter du contenu</DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau contenu à votre bibliothèque.
          </DialogDescription>
        </DialogHeader>
        
        {!apiConfigured ? (
          <DialogAlerts />
        ) : (
          <Tabs defaultValue="upload" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="upload" className="gap-2">
                <FileUp size={16} />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon size={16} />
                URL
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom du contenu</Label>
                <Input
                  id="name"
                  placeholder="Nom du fichier"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="file">Fichier</Label>
                <Input
                  type="file"
                  id="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <Label htmlFor="file" className="cursor-pointer gap-2">
                    <FileUp className="h-4 w-4" />
                    Sélectionner un fichier
                  </Label>
                </Button>
                {file && (
                  <div className="text-sm text-muted-foreground">
                    Fichier sélectionné: {file.name} ({Math.ceil(file.size / 1024)} KB)
                  </div>
                )}
                {fileError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <AlertDescription>{fileError}</AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label>Type de contenu</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={contentType === "image" ? "default" : "outline"}
                    onClick={() => setContentType("image")}
                    className="gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </Button>
                  <Button
                    variant={contentType === "video" ? "default" : "outline"}
                    onClick={() => setContentType("video")}
                    className="gap-2"
                  >
                    <Film className="h-4 w-4" />
                    Vidéo
                  </Button>
                  <Button
                    variant={contentType === "html" ? "default" : "outline"}
                    onClick={() => setContentType("html")}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    HTML
                  </Button>
                  <Button
                    variant={contentType === "powerpoint" ? "default" : "outline"}
                    onClick={() => setContentType("powerpoint")}
                    className="gap-2"
                  >
                    <Presentation className="h-4 w-4" />
                    PowerPoint
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name-url">Nom du contenu</Label>
                <Input
                  id="name-url"
                  placeholder="Nom du contenu"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  placeholder="URL du contenu"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Type de contenu</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={contentType === "image" ? "default" : "outline"}
                    onClick={() => setContentType("image")}
                    className="gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Image
                  </Button>
                  <Button
                    variant={contentType === "video" ? "default" : "outline"}
                    onClick={() => setContentType("video")}
                    className="gap-2"
                  >
                    <Film className="h-4 w-4" />
                    Vidéo
                  </Button>
                  <Button
                    variant={contentType === "html" ? "default" : "outline"}
                    onClick={() => setContentType("html")}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    HTML
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Chargement..." : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;
