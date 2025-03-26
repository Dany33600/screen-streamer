
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { Content } from '@/types';

interface ContentSelectionComponentProps {
  isLoadingContents: boolean;
  isRetrying: boolean;
  contentsError: Error | null;
  serverContents: Content[];
  selectedContentId: string;
  setSelectedContentId: (id: string) => void;
  handleRetry: () => void;
  disabled?: boolean;
}

const ContentSelectionComponent: React.FC<ContentSelectionComponentProps> = ({
  isLoadingContents,
  isRetrying,
  contentsError,
  serverContents,
  selectedContentId,
  setSelectedContentId,
  handleRetry,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="content">Contenu</Label>
      {isLoadingContents || isRetrying ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Chargement des contenus...
        </div>
      ) : contentsError ? (
        <div>
          <Alert variant="destructive" className="mb-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Erreur lors du chargement des contenus. Veuillez vérifier la connexion au serveur.
            </AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        </div>
      ) : (
        <Select 
          value={selectedContentId} 
          onValueChange={setSelectedContentId}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un contenu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucun contenu</SelectItem>
            {serverContents.map((content) => (
              <SelectItem key={content.id} value={content.id}>
                {content.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};

export default ContentSelectionComponent;
