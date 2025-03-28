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
import { useQuery, useQueryClient } from '@tanstack/react-query';

const ContentPage = () => {
  const screens = useAppStore((state) => state.screens);
  const removeContent = useAppStore((state) => state.removeContent);
  const getApiUrl = useAppStore((state) => state.getApiUrl);
  const baseIpAddress = useAppStore((state) => state.baseIpAddress);
  const queryClient = useQueryClient();
  
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
  
  // Préparer l'URL de l'API
  const getFormattedApiUrl = () => {
    let baseUrl = getApiUrl();
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return baseUrl.replace('localhost', baseIpAddress);
  };

  // Récupérer les contenus depuis l'API
  const { data: contentsData, isLoading, error } = useQuery({
    queryKey: ['contents'],
    queryFn: async () => {
      const formattedApiUrl = getFormattedApiUrl();
      console.log(`Récupération des contenus depuis: ${formattedApiUrl}/api/content`);
      
      const response = await fetch(`${formattedApiUrl}/api/content`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Données de contenu reçues:', data);
      return data.contentList || [];
    },
    refetchOnWindowFocus: false,
  });
  
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
      const content = contentsData?.find(c => c.id === id);
      if (!content) {
        throw new Error("Contenu non trouvé");
      }
      
      console.log(`Suppression du contenu avec ID exact: "${id}"`);
      
      const formattedApiUrl = getFormattedApiUrl();
      console.log(`URL complète pour la suppression: ${formattedApiUrl}/api/content/${encodeURIComponent(id)}`);
      
      // Appel à l'API pour supprimer le contenu
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
      
      // Si la suppression sur le serveur a réussi, supprimer également du store local
      removeContent(id);
      
      // Rafraîchir la liste des contenus
      queryClient.invalidateQueries({ queryKey: ['contents'] });
      
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
  const filteredContents = (contentsData || [])
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
          isLoading={isLoading}
          error={error instanceof Error ? error.message : error ? String(error) : undefined}
        />
      </div>

      {/* Dialogs */}
      <AddContentDialog 
        open={isAddDialogOpen} 
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            // Rafraîchir la liste des contenus après ajout
            queryClient.invalidateQueries({ queryKey: ['contents'] });
          }
        }} 
      />

      <EditContentDialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            // Rafraîchir la liste des contenus après modification
            queryClient.invalidateQueries({ queryKey: ['contents'] });
          }
        }}
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
