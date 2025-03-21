
import React, { useState, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import ContentCard from '@/components/content/ContentCard';
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
import { Content, Screen, ContentType } from '@/types';
import { PlusCircle, FileUp, Search, Film, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '@/hooks/use-config';

const ContentPage = () => {
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const addContent = useAppStore((state) => state.addContent);
  const updateContent = useAppStore((state) => state.updateContent);
  const removeContent = useAppStore((state) => state.removeContent);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  const { serverUrl } = useConfig();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [contentName, setContentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileURL, setSelectedFileURL] = useState<string>('');
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('image');
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setSelectedFileURL(url);
    setContentName(file.name);
    
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
  
  const handleAddContent = async () => {
    if (!selectedFile) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }
    
    if (contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return;
    }

    if (!serverUrl) {
      toast.error('URL du serveur API non configurée');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const uploadResponse = await fetch(`${serverUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || 'Erreur lors de l\'upload du fichier');
      }
      
      const uploadResult = await uploadResponse.json();
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message || 'Erreur lors de l\'upload du fichier');
      }
      
      const fileInfo = uploadResult.file;
      
      // Fix: Convert the metadata object to a JSON string
      const metadataString = JSON.stringify({
        filePath: fileInfo.path,
        serverUrl: serverUrl,
        size: fileInfo.size
      });
      
      addContent(
        selectedFile,
        contentType, 
        fileInfo.url,
        metadataString
      );
      
      resetContentForm();
      setIsAddDialogOpen(false);
      toast.success(`Contenu "${contentName}" ajouté avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Problème lors de l\'upload'}`);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleUpdateContent = () => {
    if (!currentContent) return;
    
    if (contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return;
    }
    
    updateContent(currentContent.id, { 
      name: contentName,
      type: contentType
    });
    
    setCurrentContent(null);
    resetContentForm();
    setIsEditDialogOpen(false);
    toast.success('Contenu mis à jour avec succès');
  };
  
  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    setContentName(content.name);
    setContentType(content.type);
    setSelectedFileURL(content.url);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteContent = (id: string) => {
    removeContent(id);
    toast.success('Contenu supprimé avec succès');
  };
  
  const handleAssignContent = () => {
    if (!currentContent || !selectedScreenId) return;
    
    assignContentToScreen(selectedScreenId, currentContent.id);
    setCurrentContent(null);
    setSelectedScreenId('');
    setIsAssignDialogOpen(false);
    toast.success('Contenu assigné à l\'écran avec succès');
  };
  
  const handleOpenAssignDialog = (content: Content) => {
    setCurrentContent(content);
    setSelectedScreenId(screens.find(s => s.contentId === content.id)?.id || '');
    setIsAssignDialogOpen(true);
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
  
  const filteredContents = contents
    .filter(content => {
      const matchesSearch = searchTerm === '' || 
        content.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = activeTab === 'all' || content.type === activeTab;
      
      return matchesSearch && matchesType;
    });

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contenus</h1>
            <p className="text-muted-foreground mt-1">
              Importez et gérez vos fichiers à diffuser
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher..."
                className="pl-8 w-full md:w-[260px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <PlusCircle size={16} />
              Importer
            </Button>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-2 space-x-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            Tous
          </Button>
          <Button
            variant={activeTab === 'image' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('image')}
          >
            Images
          </Button>
          <Button
            variant={activeTab === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('video')}
          >
            Vidéos
          </Button>
          <Button
            variant={activeTab === 'powerpoint' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('powerpoint')}
          >
            PowerPoint
          </Button>
          <Button
            variant={activeTab === 'pdf' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('pdf')}
          >
            PDF
          </Button>
          <Button
            variant={activeTab === 'html' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('html')}
          >
            HTML
          </Button>
        </div>

        {filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onEdit={handleEditContent}
                onDelete={handleDeleteContent}
                onAssign={handleOpenAssignDialog}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film size={64} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-1">Aucun contenu trouvé</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {searchTerm || activeTab !== 'all'
                ? "Aucun contenu ne correspond à vos critères de recherche ou au filtre actuel."
                : "Commencez par importer du contenu que vous pourrez ensuite diffuser sur vos écrans."}
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <FileUp size={16} />
              Importer du contenu
            </Button>
          </div>
        )}
      </div>

      {/* Dialog: Ajouter un contenu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                        setSelectedFile(null);
                        setSelectedFileURL('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
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
                  onChange={handleFileChange}
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
            <Button variant="outline" onClick={() => {
              resetContentForm();
              setIsAddDialogOpen(false);
            }} disabled={isUploading}>
              Annuler
            </Button>
            <Button onClick={handleAddContent} disabled={!selectedFile || isUploading}>
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

      {/* Dialog: Modifier un contenu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le contenu</DialogTitle>
            <DialogDescription>
              Modifiez les informations du contenu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedFileURL && contentType === 'image' && (
              <div className="mt-2 h-40 bg-muted rounded-md flex items-center justify-center overflow-hidden">
                <img src={selectedFileURL} alt="Preview" className="max-h-full object-contain" />
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateContent}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Assigner à un écran */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner à un écran</DialogTitle>
            <DialogDescription>
              Choisissez l'écran sur lequel diffuser ce contenu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="screen">Écran</Label>
              <Select value={selectedScreenId} onValueChange={setSelectedScreenId}>
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
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAssignContent} disabled={!selectedScreenId}>Assigner</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ContentPage;
