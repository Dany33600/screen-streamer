
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Bienvenue sur ScreenCast</h2>
        <p className="text-muted-foreground">
          Nous allons vous guider à travers les étapes nécessaires pour configurer votre application.
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Voici ce que nous allons configurer :</h3>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Les paramètres réseau (adresse IP, ports)</li>
            <li>Le code d'accès administrateur</li>
            <li>Les options de rafraîchissement des écrans</li>
            <li>La visibilité des menus</li>
          </ul>
        </div>
        
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm">
            <strong>Note :</strong> À la fin de cette configuration, vous devrez démarrer le serveur backend pour que l'application fonctionne correctement.
            Nous vous guiderons à travers cette étape.
          </p>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button onClick={onNext} className="gap-2">
          Commencer la configuration <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};

export default StepWelcome;
