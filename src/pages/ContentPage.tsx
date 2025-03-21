
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Content, ContentType } from '@/types';
import { toast } from 'sonner';

// Custom hooks
import { useContentUpload } from '@/hooks/use-content-upload';

// Components
import ContentFilters from '@/components/content/ContentFilters';
import ContentGrid from '@/components/content/ContentGrid';
import AddContentDialog from '@/components/content/AddContentDialog';
import EditContentDialog from '@/components/content/EditContentDialog';
import AssignContentDialog from '@/components/content/AssignContentDialog';

const ContentPage = () => {
  // State management
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const updateContent = useAppStore((state) => state.updateContent);
  const removeContent = useAppStore((state) => state.removeContent);
  const assignContentToScreen = useAppStore((state) => state.assignContentToScreen);
  
  // Content upload hook
  const upload = useContentUpload();
  
  // UI state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ContentType | 'all'>('all');
  
  // Current content state
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const [selectedScreenId, setSelectedScreenId] = useState<string>('');
  
  // Handlers for content operations
  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    upload.setContentName(content.name);
    upload.setContentType(content.type);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateContent = () => {
    if (!currentContent) return;
    
    if (upload.contentName.trim() === '') {
      toast.error('Le nom du contenu ne peut pas être vide');
      return;
    }
    
    updateContent(currentContent.id, { 
      name: upload.contentName,
      type: upload.contentType
    });
    
    setCurrentContent(null);
    upload.resetForm();
    setIsEditDialogOpen(false);
    toast.success('Contenu mis à jour avec succès');
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
  
  // Filter contents based on search and active tab
  const filteredContents = contents.filter(content => {
    const matchesSearch = searchTerm === '' || 
      content.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeTab === 'all' || content.type === activeTab;
    
    return matchesSearch && matchesType;
  });

  const handleAddContent = async () => {
    const success = await upload.uploadContent();
    if (success) {
      setIsAddDialogOpen(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <ContentFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddClick={() => setIsAddDialogOpen(true)}
        />

        <ContentGrid 
          contents={filteredContents}
          onEdit={handleEditContent}
          onDelete={handleDeleteContent}
          onAssign={handleOpenAssignDialog}
          onAddClick={() => setIsAddDialogOpen(true)}
        />
      </div>

      {/* Dialogs */}
      <AddContentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        isUploading={upload.isUploading}
        selectedFile={upload.selectedFile}
        selectedFileURL={upload.selectedFileURL}
        contentName={upload.contentName}
        setContentName={upload.setContentName}
        contentType={upload.contentType}
        setContentType={upload.setContentType}
        onFileChange={upload.handleFileChange}
        onUpload={handleAddContent}
        onCancel={() => {
          upload.resetForm();
          setIsAddDialogOpen(false);
        }}
      />

      <EditContentDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        previewUrl={currentContent?.url || ''}
        contentName={upload.contentName}
        setContentName={upload.setContentName}
        contentType={upload.contentType}
        setContentType={upload.setContentType}
        onSave={handleUpdateContent}
      />

      <AssignContentDialog
        isOpen={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        screens={screens}
        selectedScreenId={selectedScreenId}
        setSelectedScreenId={setSelectedScreenId}
        onAssign={handleAssignContent}
      />
    </MainLayout>
  );
};

export default ContentPage;
