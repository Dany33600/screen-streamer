
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAppStore } from '@/store';
import { Content, ContentType } from '@/types';
import ContentFilters from '@/components/content/ContentFilters';
import ContentList from '@/components/content/ContentList';
import AddContentDialog from '@/components/content/AddContentDialog';
import EditContentDialog from '@/components/content/EditContentDialog';
import AssignContentDialog from '@/components/content/AssignContentDialog';

const ContentPage = () => {
  const contents = useAppStore((state) => state.contents);
  const screens = useAppStore((state) => state.screens);
  const removeContent = useAppStore((state) => state.removeContent);
  
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
  
  const handleDeleteContent = (id: string) => {
    removeContent(id);
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
