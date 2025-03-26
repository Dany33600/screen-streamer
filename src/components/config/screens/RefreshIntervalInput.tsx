
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RefreshIntervalInputProps {
  refreshIntervalSeconds: string;
  setRefreshIntervalSeconds: (value: string) => void;
}

export const RefreshIntervalInput: React.FC<RefreshIntervalInputProps> = ({
  refreshIntervalSeconds,
  setRefreshIntervalSeconds
}) => {
  return (
    <div className="grid gap-2 pt-4">
      <Label htmlFor="refresh-interval">Intervalle de rafraîchissement (secondes)</Label>
      <Input
        id="refresh-interval"
        type="number"
        placeholder="30"
        value={refreshIntervalSeconds}
        onChange={(e) => setRefreshIntervalSeconds(e.target.value)}
        min="5"
      />
      <p className="text-sm text-muted-foreground">
        Intervalle de temps entre chaque vérification de contenu mis à jour
      </p>
    </div>
  );
};
