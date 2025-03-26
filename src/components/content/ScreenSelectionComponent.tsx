
import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Screen } from '@/types';

interface ScreenSelectionComponentProps {
  screens: Screen[];
  selectedScreenId: string;
  setSelectedScreenId: (id: string) => void;
  disabled: boolean;
}

const ScreenSelectionComponent: React.FC<ScreenSelectionComponentProps> = ({
  screens,
  selectedScreenId,
  setSelectedScreenId,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="screen">Écran</Label>
      <Select value={selectedScreenId} onValueChange={setSelectedScreenId} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un écran" />
        </SelectTrigger>
        <SelectContent>
          {screens.map((screen) => (
            <SelectItem key={screen.id} value={screen.id}>
              {screen.name} ({screen.ipAddress}:{screen.port})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ScreenSelectionComponent;
