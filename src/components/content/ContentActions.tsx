
import React from 'react';
import { Content } from '@/types';
import { Edit, MonitorPlay, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContentActionsProps {
  content: Content;
  onEdit: (content: Content) => void;
  onAssign: (content: Content) => void;
  onDelete: () => void;
}

const ContentActions: React.FC<ContentActionsProps> = ({
  content,
  onEdit,
  onAssign,
  onDelete
}) => {
  return (
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
          onClick={onDelete}
          className="text-destructive"
        >
          <Trash2 size={16} className="mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContentActions;
