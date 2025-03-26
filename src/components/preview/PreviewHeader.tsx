
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PreviewHeaderProps {
  refreshInterval: number;
}

export const PreviewHeader: React.FC<PreviewHeaderProps> = ({ refreshInterval }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-sm p-4 flex justify-between items-center border-b">
      <Button variant="outline" size="sm" onClick={handleBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="text-center">
        <h1 className="text-lg font-medium">Aperçu des écrans</h1>
        <p className="text-xs text-muted-foreground">
          Rafraîchissement toutes les {refreshInterval} minute{refreshInterval > 1 ? 's' : ''}
        </p>
      </div>
      
      {/* Cet espace vide est intentionnel pour maintenir l'alignement centré du titre */}
      <div className="w-[85px]"></div>
    </div>
  );
};
