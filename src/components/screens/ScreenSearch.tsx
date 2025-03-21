
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';

interface ScreenSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isConfigMode: boolean;
  onAddClick: () => void;
}

export const ScreenSearch: React.FC<ScreenSearchProps> = ({
  searchTerm,
  onSearchChange,
  isConfigMode,
  onAddClick,
}) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher..."
          className="pl-8 w-full md:w-[260px]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {isConfigMode && (
        <Button onClick={onAddClick} className="gap-2">
          <PlusCircle size={16} />
          Ajouter
        </Button>
      )}
    </div>
  );
};
