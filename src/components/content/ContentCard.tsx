
import React, { useState } from 'react';
import { Content } from '@/types';
import { 
  File, 
  Image, 
  FileVideo, 
  Presentation,
  FileText,
  Code,
  MoreVertical,
  Trash2,
  Edit,
  MonitorPlay
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

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

  const getIcon = () => {
    switch (content.type) {
      case 'image':
        return <Image size={24} />;
      case 'video':
        return <FileVideo size={24} />;
      case 'powerpoint':
        return <Presentation size={24} />;
      case 'pdf':
        return <FileText size={24} />;
      case 'html':
        return <Code size={24} />;
      default:
        return <File size={24} />;
    }
  };

  const getTypeLabel = () => {
    switch (content.type) {
      case 'image':
        return 'Image';
      case 'video':
        return 'Vidéo';
      case 'powerpoint':
        return 'PowerPoint';
      case 'pdf':
        return 'PDF';
      case 'html':
        return 'HTML';
      default:
        return 'Fichier';
    }
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    console.log("Suppression du contenu avec ID:", content.id);
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
              {getIcon()}
              <span className="mt-2 text-sm">{getTypeLabel()}</span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-lg truncate">{content.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ajouté {formatDistanceToNow(content.createdAt, { locale: fr, addSuffix: true })}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(content)}>
                  <Edit size={16} className="mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(content)}>
                  <MonitorPlay size={16} className="mr-2" />
                  Assigner à un écran
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={openDeleteDialog}
                  className="text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 bg-muted/30 border-t flex justify-between">
          <Badge variant="outline">
            {getTypeLabel()}
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le contenu</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer "{content.name}" ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ContentCard;
