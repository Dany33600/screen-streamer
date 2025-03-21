
import React, { useState } from 'react';
import { Content } from '@/types';
import { Trash2, MonitorPlay } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ContentTypeIcon, { getTypeLabel } from './ContentTypeIcon';
import ContentActions from './ContentActions';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import { formatDate } from '@/utils/dateFormatter';

interface ContentCardProps {
  content: Content;
  onEdit: (content: Content) => void;
  onDelete: (id: string) => void;
  onAssign: (content: Content) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  onEdit, 
  onDelete,
  onAssign
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    console.log("Suppression du contenu avec ID exact:", content.id);
    onDelete(content.id);
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden hover-scale">
        <div className="h-40 relative bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          {content.type === 'image' ? (
            <img 
              src={content.url} 
              alt={content.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
              <ContentTypeIcon type={content.type} />
              <span className="mt-2 text-sm">{getTypeLabel(content.type)}</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg truncate">{content.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ajouté le {formatDate(content.createdAt)}
              </p>
            </div>
            <ContentActions 
              content={content}
              onEdit={onEdit}
              onAssign={onAssign}
              onDelete={openDeleteDialog}
            />
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 bg-muted/30 border-t flex justify-between">
          <Badge variant="outline">
            {getTypeLabel(content.type)}
          </Badge>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8" 
              onClick={() => onAssign(content)}
            >
              <MonitorPlay size={14} className="mr-1" />
              Assigner
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-8 text-destructive hover:bg-destructive hover:text-white border-destructive" 
              onClick={openDeleteDialog}
            >
              <Trash2 size={14} className="mr-1" />
              Supprimer
            </Button>
          </div>
        </CardFooter>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        itemName={content.name}
      />
    </>
  );
};

export default ContentCard;
