
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Content, ContentType } from '@/types';
import ContentFilters from '@/components/content/ContentFilters';
import ContentList from '@/components/content/ContentList';
import AddContentDialog from '@/components/content/AddContentDialog';
import EditContentDialog from '@/components/content/EditContentDialog';
import AssignContentDialog from '@/components/content/AssignContentDialog';
import { toast } from 'sonner';

const ContentPage = () => {
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const removeContent = useAppStore((state) => state.removeContent);
  const apiUrl = useAppStore((state) => state.apiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  
  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  
  // Content state
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [contentName, setContentName] = useState('');
  const [contentType, setContentType] = useState<ContentType>('image');
  const [selectedFileURL, setSelectedFileURL] = useState<string>('');
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  
  // Handler functions
  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    setContentName(content.name);
    setContentType(content.type);
    setSelectedFileURL(content.url);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteContent = async (id: string) => {
    try {
      const content = contents.find(c => c.id === id);
      if (!content) {
        throw new Error("Contenu non trouvé");
      }
      
      console.log(`Suppression du contenu avec ID exact: "${id}"`);
      
      // Préparer l'URL de l'API
      let baseUrl = apiUrl;
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      
      // Remplacer localhost par l'adresse IP si nécessaire
      const formattedApiUrl = baseUrl.replace('localhost', baseIpAddress);
      
      // Log pour déboguer l'URL et l'ID
      console.log(`ID du contenu à supprimer: "${id}"`);
      console.log(`URL complète pour la suppression: ${formattedApiUrl}/api/content/${encodeURIComponent(id)}`);
      
      // Supprimer le contenu localement avant l'appel API pour améliorer la réactivité de l'UI
      removeContent(id);
      
      // Appel à l'API pour supprimer le contenu - utiliser l'ID exact
      const response = await fetch(`${formattedApiUrl}/api/content/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur de suppression du contenu:", errorData);
        throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
      }
      
      toast.success(`Le contenu "${content.name}" a été supprimé`);
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Échec de la suppression: ${errorMessage}`);
    }
  };
  
  const handleOpenAssignDialog = (content: Content) => {
    setCurrentContent(content);
    setSelectedScreenId(screens.find(s => s.contentId === content.id)?.id || '');
    setIsAssignDialogOpen(true);
  };
  
  // Filter contents
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
        {/* Filters */}
        <ContentFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddClick={() => setIsAddDialogOpen(true)}
        />

        {/* Content List */}
        <ContentList 
          contents={filteredContents}
          onEdit={handleEditContent}
          onDelete={handleDeleteContent}
          onAssign={handleOpenAssignDialog}
          onAddClick={() => setIsAddDialogOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <AddContentDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />

      <EditContentDialog 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen}
        content={currentContent}
        contentName={contentName}
        setContentName={setContentName}
        contentType={contentType}
        setContentType={setContentType}
        fileURL={selectedFileURL}
      />

      <AssignContentDialog 
        open={isAssignDialogOpen} 
        onOpenChange={setIsAssignDialogOpen}
        content={currentContent}
        selectedScreenId={selectedScreenId}
        setSelectedScreenId={setSelectedScreenId}
        screens={screens}
      />
    </MainLayout>
  );
};

export default ContentPage;
