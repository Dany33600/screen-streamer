
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import { ContentType } from '@/types';

interface ContentFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeTab: ContentType | 'all';
  setActiveTab: (tab: ContentType | 'all') => void;
  onAddClick: () => void;
}

const ContentFilters: React.FC<ContentFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  onAddClick
}) => {
  return (
    <>
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
          <Button onClick={onAddClick} className="gap-2">
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
    </>
  );
};

export default ContentFilters;
