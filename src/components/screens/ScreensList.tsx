
import React from 'react';
import { MonitorPlay, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Screen } from '@/types';
import ScreenCard from './ScreenCard';

interface ScreensListProps {
  screens: Screen[];
  filteredScreens: Screen[];
  isLoading: boolean;
  searchTerm: string;
  onEdit: (screen: Screen) => void;
  onDelete: (id: string) => void;
  onSelect: (screen: Screen) => void;
  onAddScreen: () => void;
  isConfigMode: boolean;
}

const ScreensList: React.FC<ScreensListProps> = ({
  screens,
  filteredScreens,
  isLoading,
  searchTerm,
  onEdit,
  onDelete,
  onSelect,
  onAddScreen,
  isConfigMode
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Chargement des écrans...</span>
      </div>
    );
  }

  if (filteredScreens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <MonitorPlay size={64} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">Aucun écran configuré</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          {searchTerm 
            ? "Aucun écran ne correspond à votre recherche. Essayez d'autres termes."
            : "Commencez par ajouter un écran pour diffuser du contenu. Vous pourrez ensuite lui assigner du contenu."}
        </p>
        {isConfigMode && !searchTerm && (
          <Button onClick={onAddScreen} className="gap-2">
            <MonitorPlay size={16} />
            Ajouter un écran
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredScreens.map((screen) => (
        <ScreenCard
          key={screen.id}
          screen={screen}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default ScreensList;
