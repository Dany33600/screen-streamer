
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface DialogAlertsProps {
  serverNotConfigured?: boolean;
  noScreens?: boolean;
}

const DialogAlerts: React.FC<DialogAlertsProps> = ({
  serverNotConfigured = false,
  noScreens = false
}) => {
  return (
    <>
      {serverNotConfigured && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Le serveur API n'est pas configuré. Veuillez configurer l'URL de l'API dans les paramètres.
          </AlertDescription>
        </Alert>
      )}
      
      {noScreens && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Aucun écran n'est disponible. Veuillez d'abord ajouter un écran.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default DialogAlerts;
