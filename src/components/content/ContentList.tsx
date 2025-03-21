
import React from 'react';
import { Content } from '@/types';
import { FileUp, Film, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentCard from './ContentCard';
import { useAppStore } from '@/store';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentListProps {
  contents: Content[];
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  onAssign: (content: Content) => void;
  onAddClick: () => void;
}

const ContentList: React.FC<ContentListProps> = ({
  contents,
  onEdit,
  onDelete,
  onAssign,
  onAddClick
}) => {
  const apiUrl = useAppStore(state => state.apiUrl);
  const serverConfigured = apiUrl && apiUrl.trim() !== '';

  if (!serverConfigured) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive" className="mb-4">
          <ServerCrash className="h-4 w-4 mr-2" />
          <AlertDescription>
            Le serveur API n'est pas configuré. Vous devez configurer l'URL de l'API dans les paramètres avant de pouvoir importer du contenu.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ServerCrash size={64} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-1">Serveur non configuré</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Pour commencer à uploader du contenu, vous devez d'abord configurer l'URL du serveur API.
          </p>
          <Button variant="secondary" className="gap-2" onClick={() => window.location.href = '/config'}>
            Configurer le serveur
          </Button>
        </div>
      </div>
    );
  }

  if (contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Film size={64} className="text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-1">Aucun contenu trouvé</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Commencez par importer du contenu que vous pourrez ensuite diffuser sur vos écrans.
        </p>
        <Button onClick={onAddClick} className="gap-2">
          <FileUp size={16} />
          Importer du contenu
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
        />
      ))}
    </div>
  );
};

export default ContentList;
