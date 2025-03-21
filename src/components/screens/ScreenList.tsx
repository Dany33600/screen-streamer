
import React from 'react';
import { Screen } from '@/types';
import ScreenCard from '@/components/screens/ScreenCard';
import { MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ScreenListProps {
  screens: Screen[];
  searchTerm: string;
  isConfigMode: boolean;
  onEdit: (screen: Screen) => void;
  onDelete: (id: string) => void;
  onSelect: (screen: Screen) => void;
  onAdd: () => void;
}

export const ScreenList: React.FC<ScreenListProps> = ({
  screens,
  searchTerm,
  isConfigMode,
  onEdit,
  onDelete,
  onSelect,
  onAdd,
}) => {
  const filteredScreens = searchTerm
    ? screens.filter(screen => 
        screen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        screen.port.toString().includes(searchTerm)
      )
    : screens;

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
          <Button onClick={onAdd} className="gap-2">
            <PlusCircle size={16} />
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
