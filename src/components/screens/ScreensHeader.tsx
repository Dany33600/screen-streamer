
import React from 'react';
import { PlusCircle, Search, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ScreensHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddScreen: () => void;
  onRefresh: () => void;
  isConfigMode: boolean;
  isLoading: boolean;
  isRetrying: boolean;
}

const ScreensHeader: React.FC<ScreensHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onAddScreen,
  onRefresh,
  isConfigMode,
  isLoading,
  isRetrying
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Écrans</h1>
        <p className="text-muted-foreground mt-1">
          Gérez vos écrans et assignez-leur du contenu
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        {isConfigMode && (
          <Button onClick={onAddScreen} className="gap-2">
            <PlusCircle size={16} />
            Ajouter
          </Button>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onRefresh} 
          disabled={isLoading || isRetrying}
          title="Rafraîchir les écrans"
        >
          {isLoading || isRetrying ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScreensHeader;
